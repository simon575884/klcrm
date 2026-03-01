import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      client_name,
      phone,
      email,
      vehicle_number,
      service_type,
      appointment_date,
      appointment_time,
      problem_description,
      status
    } = req.body;

    if (!client_name || !phone || !service_type || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_name,
        phone,
        email: email || null,
        vehicle_number: vehicle_number || null,
        service_type,
        appointment_date,
        appointment_time,
        problem_description: problem_description || null,
        status: status || 'Pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      client_name,
      phone,
      email,
      vehicle_number,
      service_type,
      appointment_date,
      appointment_time,
      problem_description,
      status
    } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .update({
        client_name,
        phone,
        email: email || null,
        vehicle_number: vehicle_number || null,
        service_type,
        appointment_date,
        appointment_time,
        problem_description: problem_description || null,
        status
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
