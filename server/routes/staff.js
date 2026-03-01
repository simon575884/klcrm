import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all staff
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Get staff by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Create staff member
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, position, salary, hire_date, status } = req.body;

    if (!name || !phone || !position || !hire_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('staff')
      .insert({
        name,
        phone,
        email: email || null,
        position,
        salary: salary || null,
        hire_date,
        status: status || 'Active'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Update staff member
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, position, salary, hire_date, status } = req.body;

    const { data, error } = await supabase
      .from('staff')
      .update({
        name,
        phone,
        email: email || null,
        position,
        salary: salary || null,
        hire_date,
        status
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

export default router;
