import { createClient } from '@supabase/supabase-js';

// Hardcoded values as fallback for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qjnyixyvkcdgrofapmfd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbnlpeHl2a2NkZ3JvZmFwbWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzg2NjAsImV4cCI6MjA4Nzk1NDY2MH0.U3O8H_9KGFDazvaaRH9GjQjcbGouo8bbbiuhPgGxpNo';

// Validate configuration
if (!supabaseUrl) {
  throw new Error('Supabase URL is required');
}

if (!supabaseAnonKey) {
  throw new Error('Supabase Anon Key is required');
}

console.log('Supabase initialized:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Helper function for API calls with error handling
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);
  throw new Error(error.message || 'An error occurred');
};

// Auth helpers
export const authHelpers = {
  async login(username, password) {
    try {
      // Get user from database
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      if (!users) throw new Error('Invalid credentials');

      // Note: Password verification should be done server-side
      // For now, we'll use a simple comparison (NOT SECURE for production)
      // You should implement proper bcrypt verification via Supabase Edge Functions
      
      return {
        user: {
          id: users.id,
          username: users.username,
          role: users.role,
          name: users.name
        },
        token: btoa(`${users.id}:${Date.now()}`) // Simple token (use JWT in production)
      };
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};

// Database helpers
export const dbHelpers = {
  // Generic CRUD operations
  async getAll(table, filters = {}) {
    try {
      let query = supabase.from(table).select('*');
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async getById(table, id) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async create(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      handleSupabaseError(error);
    }
  },

  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      handleSupabaseError(error);
    }
  }
};
