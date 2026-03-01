import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Debug: Log environment variables
console.log('🔍 Environment Variables:');
console.log('SUPABASE_DB_HOST:', process.env.SUPABASE_DB_HOST);
console.log('SUPABASE_DB_USER:', process.env.SUPABASE_DB_USER);
console.log('SUPABASE_DB_NAME:', process.env.SUPABASE_DB_NAME);
console.log('Password set:', process.env.SUPABASE_DB_PASSWORD ? 'Yes' : 'No');

// Supabase PostgreSQL Connection Configuration
// Using connection string for better compatibility
const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Database query helper
export const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get all records from a table
export const getAll = async (table) => {
  const result = await query(`SELECT * FROM ${table} ORDER BY id DESC`);
  return result.rows;
};

// Get record by ID
export const getById = async (table, id) => {
  const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0];
};

// Insert record
export const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');
  
  const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await query(text, values);
  return result.rows[0];
};

// Update record
export const update = async (table, id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  
  const text = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await query(text, [...values, id]);
  return result.rows[0];
};

// Delete record
export const deleteRecord = async (table, id) => {
  const text = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
  const result = await query(text, [id]);
  return result.rows[0];
};

// Search with WHERE clause
export const search = async (table, whereClause, params) => {
  const text = `SELECT * FROM ${table} WHERE ${whereClause}`;
  const result = await query(text, params);
  return result.rows;
};

// Custom query execution
export const executeQuery = async (text, params = []) => {
  const result = await query(text, params);
  return result.rows;
};

// Get repair jobs with full details (using view)
export const getRepairJobsWithDetails = async () => {
  const result = await query('SELECT * FROM repair_jobs_view ORDER BY id DESC');
  return result.rows;
};

// Get vehicles with customer info (using view)
export const getVehiclesWithCustomerInfo = async () => {
  const result = await query('SELECT * FROM vehicles_view ORDER BY id DESC');
  return result.rows;
};

// Dashboard statistics
export const getDashboardStats = async () => {
  const stats = {};
  
  // Total customers
  const customersResult = await query('SELECT COUNT(*) as count FROM customers');
  stats.totalCustomers = parseInt(customersResult.rows[0].count);
  
  // Total repair jobs
  const repairsResult = await query('SELECT COUNT(*) as count FROM repairs');
  stats.totalRepairs = parseInt(repairsResult.rows[0].count);
  
  // Pending jobs
  const pendingResult = await query("SELECT COUNT(*) as count FROM repairs WHERE repair_status = 'Pending'");
  stats.pendingJobs = parseInt(pendingResult.rows[0].count);
  
  // Completed jobs
  const completedResult = await query("SELECT COUNT(*) as count FROM repairs WHERE repair_status = 'Completed'");
  stats.completedJobs = parseInt(completedResult.rows[0].count);
  
  // In Progress jobs
  const inProgressResult = await query("SELECT COUNT(*) as count FROM repairs WHERE repair_status = 'In Progress'");
  stats.inProgressJobs = parseInt(inProgressResult.rows[0].count);
  
  // Total earnings
  const earningsResult = await query("SELECT COALESCE(SUM(payment_amount), 0) as total FROM repairs WHERE payment_status = 'Paid'");
  stats.totalEarnings = parseFloat(earningsResult.rows[0].total);
  
  // Today's appointments
  const appointmentsResult = await query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURRENT_DATE");
  stats.todayAppointments = parseInt(appointmentsResult.rows[0].count);
  
  // Pending appointments
  const pendingAppointmentsResult = await query("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'");
  stats.pendingAppointments = parseInt(pendingAppointmentsResult.rows[0].count);
  
  // Total appointments
  const totalAppointmentsResult = await query("SELECT COUNT(*) as count FROM appointments");
  stats.totalAppointments = parseInt(totalAppointmentsResult.rows[0].count);
  
  // Staff present today
  const staffPresentResult = await query("SELECT COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE AND status = 'Present'");
  stats.staffPresent = parseInt(staffPresentResult.rows[0].count);
  
  // Staff on leave
  const staffLeaveResult = await query("SELECT COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE AND status = 'Leave'");
  stats.staffOnLeave = parseInt(staffLeaveResult.rows[0].count);
  
  // Total staff
  const totalStaffResult = await query("SELECT COUNT(*) as count FROM staff WHERE status = 'Active'");
  stats.totalStaff = parseInt(totalStaffResult.rows[0].count);
  
  return stats;
};

export default {
  query,
  getAll,
  getById,
  insert,
  update,
  deleteRecord,
  search,
  executeQuery,
  getRepairJobsWithDetails,
  getVehiclesWithCustomerInfo,
  getDashboardStats,
  pool
};
