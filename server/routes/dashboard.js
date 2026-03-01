import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};
    
    // Total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    stats.totalCustomers = totalCustomers || 0;
    
    // Total repair jobs
    const { count: totalRepairs } = await supabase
      .from('repairs')
      .select('*', { count: 'exact', head: true });
    stats.totalRepairs = totalRepairs || 0;
    
    // Pending jobs
    const { count: pendingJobs } = await supabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })
      .eq('repair_status', 'Pending');
    stats.pendingJobs = pendingJobs || 0;
    
    // Completed jobs
    const { count: completedJobs } = await supabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })
      .eq('repair_status', 'Completed');
    stats.completedJobs = completedJobs || 0;
    
    // In Progress jobs
    const { count: inProgressJobs } = await supabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })
      .eq('repair_status', 'In Progress');
    stats.inProgressJobs = inProgressJobs || 0;
    
    // Total earnings
    const { data: paidRepairs } = await supabase
      .from('repairs')
      .select('payment_amount')
      .eq('payment_status', 'Paid');
    stats.totalEarnings = paidRepairs?.reduce((sum, r) => sum + parseFloat(r.payment_amount || 0), 0) || 0;
    
    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today);
    stats.todayAppointments = todayAppointments || 0;
    
    // Pending appointments
    const { count: pendingAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending');
    stats.pendingAppointments = pendingAppointments || 0;
    
    // Total appointments
    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });
    stats.totalAppointments = totalAppointments || 0;
    
    // Staff present today
    const { count: staffPresent } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Present');
    stats.staffPresent = staffPresent || 0;
    
    // Staff on leave
    const { count: staffOnLeave } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Leave');
    stats.staffOnLeave = staffOnLeave || 0;
    
    // Total staff
    const { count: totalStaff } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');
    stats.totalStaff = totalStaff || 0;
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get monthly earnings data for chart
router.get('/monthly-earnings', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .select('payment_amount, created_at')
      .eq('payment_status', 'Paid')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) throw error;
    
    // Group by month
    const monthlyData = {};
    data.forEach(repair => {
      const date = new Date(repair.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: date.toLocaleString('default', { month: 'short' }), total: 0 };
      }
      monthlyData[monthKey].total += parseFloat(repair.payment_amount || 0);
    });
    
    res.json(Object.values(monthlyData));
  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    res.status(500).json({ error: 'Failed to fetch monthly earnings' });
  }
});

// Get repair status distribution for chart
router.get('/repair-status-distribution', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .select('repair_status');
    
    if (error) throw error;
    
    // Count by status
    const distribution = {};
    data.forEach(repair => {
      const status = repair.repair_status;
      distribution[status] = (distribution[status] || 0) + 1;
    });
    
    const result = Object.entries(distribution).map(([status, count]) => ({
      status,
      count
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching repair status distribution:', error);
    res.status(500).json({ error: 'Failed to fetch repair status distribution' });
  }
});

// Get recent activities
router.get('/recent-activities', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repair_jobs_view')
      .select('id, customer_name, repair_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    const activities = data.map(item => ({
      type: 'repair',
      id: item.id,
      title: item.customer_name,
      status: item.repair_status,
      created_at: item.created_at
    }));
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

export default router;
