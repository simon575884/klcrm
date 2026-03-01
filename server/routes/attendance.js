import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all attendance records with staff info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        *,
        staff:staff_id (
          name,
          position
        )
      `)
      .order('date', { ascending: false })
      .order('id', { ascending: false });
    
    if (error) throw error;
    
    // Flatten the response
    const result = attendance.map(a => ({
      ...a,
      staff_name: a.staff?.name,
      position: a.staff?.position
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance by date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        *,
        staff:staff_id (
          name,
          position
        )
      `)
      .eq('date', req.params.date)
      .order('id', { ascending: false });
    
    if (error) throw error;
    
    const result = attendance.map(a => ({
      ...a,
      staff_name: a.staff?.name,
      position: a.staff?.position
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance by staff ID
router.get('/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        *,
        staff:staff_id (
          name,
          position
        )
      `)
      .eq('staff_id', req.params.staffId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const result = attendance.map(a => ({
      ...a,
      staff_name: a.staff?.name,
      position: a.staff?.position
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Create attendance record (Check-in)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { staff_id, date, check_in_time, check_out_time, status, notes } = req.body;

    if (!staff_id || !date) {
      return res.status(400).json({ error: 'Staff ID and date are required' });
    }

    // Check if attendance already exists
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('date', date);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Attendance already marked for this date' });
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        staff_id,
        date,
        check_in_time: check_in_time || null,
        check_out_time: check_out_time || null,
        status: status || 'Present',
        notes: notes || null
      })
      .select(`
        *,
        staff:staff_id (
          name,
          position
        )
      `)
      .single();

    if (error) throw error;
    
    const result = {
      ...data,
      staff_name: data.staff?.name,
      position: data.staff?.position
    };
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// Update attendance record (Check-out or edit)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { check_in_time, check_out_time, status, notes } = req.body;

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_in_time: check_in_time || null,
        check_out_time: check_out_time || null,
        status,
        notes: notes || null
      })
      .eq('id', req.params.id)
      .select(`
        *,
        staff:staff_id (
          name,
          position
        )
      `)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    const result = {
      ...data,
      staff_name: data.staff?.name,
      position: data.staff?.position
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
});

// Delete attendance record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

export default router;
