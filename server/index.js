import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './supabaseClient.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import vehicleRoutes from './routes/vehicles.js';
import repairRoutes from './routes/repairs.js';
import dashboardRoutes from './routes/dashboard.js';
import invoiceRoutes from './routes/invoices.js';
import appointmentRoutes from './routes/appointments.js';
import staffRoutes from './routes/staff.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

// Test Supabase connection on startup
testConnection().then((success) => {
  if (success) {
    console.log('✅ Supabase connection verified');
  } else {
    console.log('⚠️ Supabase connection issue - check credentials');
  }
}).catch(err => {
  console.error('❌ Supabase connection test failed:', err.message);
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`🚗 K&L Auto Repair CRM Server running on http://localhost:${PORT}`);
  console.log(`✨ Using Supabase REST API`);
  console.log(`📊 Database Type: ${process.env.DATABASE_TYPE || 'supabase'}`);
});
