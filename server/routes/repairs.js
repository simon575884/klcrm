import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all repair jobs with full details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repair_jobs_view')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

// Get repair by ID with full details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repair_jobs_view')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Repair job not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching repair:', error);
    res.status(500).json({ error: 'Failed to fetch repair' });
  }
});

// Create repair job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      vehicle_id,
      problem_description,
      repair_details,
      repair_cost,
      repair_status,
      payment_amount,
      payment_method,
      payment_status
    } = req.body;

    if (!customer_id || !vehicle_id || !problem_description || !repair_cost) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('repairs')
      .insert({
        customer_id,
        vehicle_id,
        problem_description,
        repair_details: repair_details || null,
        repair_cost,
        repair_status: repair_status || 'Pending',
        payment_amount: payment_amount || 0,
        payment_method: payment_method || null,
        payment_status: payment_status || 'Unpaid'
      })
      .select()
      .single();

    if (error) throw error;

    // Get full details from view
    const { data: fullData, error: viewError } = await supabase
      .from('repair_jobs_view')
      .select('*')
      .eq('id', data.id)
      .single();

    if (viewError) throw viewError;
    res.status(201).json(fullData);
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({ error: 'Failed to create repair job' });
  }
});

// Update repair job
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      problem_description,
      repair_details,
      repair_cost,
      repair_status,
      payment_amount,
      payment_method,
      payment_status
    } = req.body;

    const { data, error } = await supabase
      .from('repairs')
      .update({
        problem_description,
        repair_details: repair_details || null,
        repair_cost,
        repair_status,
        payment_amount,
        payment_method: payment_method || null,
        payment_status
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    // Get full details from view
    const { data: fullData, error: viewError } = await supabase
      .from('repair_jobs_view')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (viewError) throw viewError;
    res.json(fullData);
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({ error: 'Failed to update repair job' });
  }
});

// Delete repair job
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Repair job not found' });
    }
    res.json({ message: 'Repair job deleted successfully' });
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({ error: 'Failed to delete repair job' });
  }
});

export default router;
