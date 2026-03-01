import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 Supabase Client Config:');
console.log('URL:', supabaseUrl);
console.log('Key set:', supabaseKey ? 'Yes' : 'No');

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase REST API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

// Helper functions for database operations
export const dbHelpers = {
  // Get all records
  async getAll(table) {
    const { data, error } = await supabase.from(table).select('*').order('id', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get by ID
  async getById(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Insert
  async insert(table, record) {
    const { data, error } = await supabase.from(table).insert(record).select().single();
    if (error) throw error;
    return data;
  },

  // Update
  async update(table, id, record) {
    const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Delete
  async delete(table, id) {
    const { data, error } = await supabase.from(table).delete().eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Search
  async search(table, column, value) {
    const { data, error } = await supabase.from(table).select('*').ilike(column, `%${value}%`);
    if (error) throw error;
    return data;
  },

  // Custom query with filters
  async query(table, filters = {}) {
    let query = supabase.from(table).select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

export default supabase;
