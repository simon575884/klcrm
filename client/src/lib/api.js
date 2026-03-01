import { supabase } from './supabase';

// API wrapper for all backend calls using Supabase
const api = {
  // Auth APIs
  auth: {
    async login(username, password) {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (error || !users) {
          throw new Error('Invalid username or password');
        }

        // Simple password validation (replace with proper bcrypt in production)
        const validPasswords = {
          'owner': 'owner123',
          'worker': 'worker123',
          'receptionist': 'receptionist123'
        };

        if (validPasswords[username] !== password) {
          throw new Error('Invalid username or password');
        }

        return {
          user: {
            id: users.id,
            username: users.username,
            role: users.role,
            name: users.name
          },
          token: btoa(`${users.id}:${Date.now()}`)
        };
      } catch (error) {
        throw error;
      }
    }
  },

  // Dashboard APIs
  dashboard: {
    async getStats() {
      try {
        const [customers, repairs, appointments, staff, attendance] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('repairs').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('staff').select('*'),
          supabase.from('attendance').select('*').eq('date', new Date().toISOString().split('T')[0])
        ]);

        const repairData = repairs.data || [];
        const appointmentData = appointments.data || [];
        const staffData = staff.data || [];
        const attendanceData = attendance.data || [];

        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointmentData.filter(a => a.appointment_date?.startsWith(today));

        return {
          totalCustomers: customers.count || 0,
          totalRepairJobs: repairData.length,
          pendingJobs: repairData.filter(r => r.status === 'pending').length,
          completedJobs: repairData.filter(r => r.status === 'completed').length,
          totalEarnings: repairData
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (parseFloat(r.total_cost) || 0), 0),
          todayAppointments: todayAppointments.length,
          staffPresent: attendanceData.filter(a => a.status === 'present').length,
          staffOnLeave: attendanceData.filter(a => a.status === 'leave').length
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
          totalCustomers: 0,
          totalRepairJobs: 0,
          pendingJobs: 0,
          completedJobs: 0,
          totalEarnings: 0,
          todayAppointments: 0,
          staffPresent: 0,
          staffOnLeave: 0
        };
      }
    },

    async getMonthlyEarnings() {
      try {
        const { data, error } = await supabase
          .from('repairs')
          .select('total_cost, completed_date')
          .eq('status', 'completed')
          .not('completed_date', 'is', null);

        if (error) throw error;

        // Group by month
        const monthlyData = {};
        (data || []).forEach(repair => {
          if (repair.completed_date) {
            const month = repair.completed_date.substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + parseFloat(repair.total_cost || 0);
          }
        });

        return Object.entries(monthlyData).map(([month, earnings]) => ({
          month,
          earnings
        }));
      } catch (error) {
        console.error('Monthly earnings error:', error);
        return [];
      }
    },

    async getJobStatusDistribution() {
      try {
        const { data, error } = await supabase
          .from('repairs')
          .select('status');

        if (error) throw error;

        const distribution = {};
        (data || []).forEach(repair => {
          distribution[repair.status] = (distribution[repair.status] || 0) + 1;
        });

        return Object.entries(distribution).map(([status, count]) => ({
          status,
          count
        }));
      } catch (error) {
        console.error('Job distribution error:', error);
        return [];
      }
    }
  },

  // Customers APIs
  customers: {
    async getAll() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(customer) {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, customer) {
      const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // Vehicles APIs
  vehicles: {
    async getAll() {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          customers (
            name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(vehicle) {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, vehicle) {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // Repairs APIs
  repairs: {
    async getAll() {
      const { data, error } = await supabase
        .from('repairs')
        .select(`
          *,
          customers (
            name,
            phone
          ),
          vehicles (
            make,
            model,
            year,
            license_plate
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(repair) {
      const { data, error } = await supabase
        .from('repairs')
        .insert([repair])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, repair) {
      const { data, error } = await supabase
        .from('repairs')
        .update(repair)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('repairs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // Appointments APIs
  appointments: {
    async getAll() {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            name,
            phone
          ),
          vehicles (
            make,
            model,
            license_plate
          )
        `)
        .order('appointment_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async create(appointment) {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, appointment) {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointment)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // Staff APIs
  staff: {
    async getAll() {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async create(staff) {
      const { data, error } = await supabase
        .from('staff')
        .insert([staff])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, staff) {
      const { data, error } = await supabase
        .from('staff')
        .update(staff)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // Attendance APIs
  attendance: {
    async getAll() {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          staff (
            name,
            position
          )
        `)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(attendance) {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendance])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, attendance) {
      const { data, error } = await supabase
        .from('attendance')
        .update(attendance)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  }
};

export default api;
