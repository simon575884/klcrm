import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all vehicles with customer info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles_view')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Search vehicle by number plate
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { plate } = req.query;
    const { data, error } = await supabase
      .from('vehicles_view')
      .select('*')
      .ilike('number_plate', `%${plate}%`);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get vehicles by customer ID
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', req.params.customerId);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching customer vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Create vehicle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customer_id, car_model, number_plate, manufacturing_year, color } = req.body;

    if (!customer_id || !car_model || !number_plate || !manufacturing_year) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        customer_id,
        car_model,
        number_plate,
        manufacturing_year,
        color: color || null
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Number plate already exists' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Update vehicle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { car_model, number_plate, manufacturing_year, color } = req.body;

    const { data, error } = await supabase
      .from('vehicles')
      .update({
        car_model,
        number_plate,
        manufacturing_year,
        color: color || null
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
