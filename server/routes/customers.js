import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Search customer by phone
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.query;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .ilike('phone', `%${phone}%`);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        name,
        phone,
        email: email || null,
        address: address || null
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const { data, error } = await supabase
      .from('customers')
      .update({
        name,
        phone,
        email: email || null,
        address: address || null
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
