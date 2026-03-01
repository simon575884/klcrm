import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'kl_crm.json');

class JSONDatabase {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    if (existsSync(dbPath)) {
      try {
        return JSON.parse(readFileSync(dbPath, 'utf8'));
      } catch (error) {
        return this.getDefaultData();
      }
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      users: [],
      customers: [],
      vehicles: [],
      repair_jobs: [],
      invoices: [],
      appointments: [],
      staff: [],
      attendance: [],
      notifications: []
    };
  }

  save() {
    writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
  }

  prepare(sql) {
    const self = this;
    return {
      async run(...params) {
        const result = await self.executeSQL(sql, params);
        return result;
      },
      async get(...params) {
        const result = await self.executeSQL(sql, params);
        return result && result.length > 0 ? result[0] : undefined;
      },
      async all(...params) {
        const result = await self.executeSQL(sql, params);
        return result || [];
      }
    };
  }

  async executeSQL(sql, params) {
    const sqlLower = sql.toLowerCase().trim();
    
    // INSERT
    if (sqlLower.startsWith('insert')) {
      return this.handleInsert(sql, params);
    }
    
    // SELECT
    if (sqlLower.startsWith('select')) {
      return this.handleSelect(sql, params);
    }
    
    // UPDATE
    if (sqlLower.startsWith('update')) {
      return this.handleUpdate(sql, params);
    }
    
    // DELETE
    if (sqlLower.startsWith('delete')) {
      return this.handleDelete(sql, params);
    }
    
    return null;
  }

  handleInsert(sql, params) {
    const tableMatch = sql.match(/insert\s+(?:or\s+ignore\s+)?into\s+(\w+)/i);
    if (!tableMatch) return null;
    
    const table = tableMatch[1];
    const valuesMatch = sql.match(/values\s*\((.*?)\)/i);
    if (!valuesMatch) return null;
    
    const columnsMatch = sql.match(/\((.*?)\)\s*values/i);
    const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];
    
    const newId = this.data[table].length > 0 
      ? Math.max(...this.data[table].map(r => r.id || 0)) + 1 
      : 1;
    
    const newRecord = { id: newId, created_at: new Date().toISOString() };
    columns.forEach((col, idx) => {
      newRecord[col] = params[idx];
    });
    
    // Check for IGNORE and unique constraints
    if (sql.toLowerCase().includes('or ignore')) {
      const existing = this.data[table].find(r => {
        if (table === 'users') return r.username === newRecord.username;
        if (table === 'customers') return r.phone === newRecord.phone;
        if (table === 'vehicles') return r.number_plate === newRecord.number_plate;
        return false;
      });
      if (existing) return { lastInsertRowid: existing.id };
    }
    
    this.data[table].push(newRecord);
    this.save();
    
    return { lastInsertRowid: newId, changes: 1 };
  }

  handleSelect(sql, params) {
    const fromMatch = sql.match(/from\s+(\w+)/i);
    if (!fromMatch) return [];
    
    const table = fromMatch[1];
    let results = [...(this.data[table] || [])];
    
    // Handle JOINs
    if (sql.toLowerCase().includes('join')) {
      results = this.handleJoins(sql, results);
    }
    
    // Handle WHERE
    if (sql.toLowerCase().includes('where')) {
      results = this.handleWhere(sql, params, results, table);
    }
    
    // Handle GROUP BY and aggregates
    if (sql.toLowerCase().includes('group by') || sql.toLowerCase().includes('count(') || sql.toLowerCase().includes('sum(')) {
      results = this.handleAggregates(sql, results);
    }
    
    // Handle ORDER BY
    if (sql.toLowerCase().includes('order by')) {
      results = this.handleOrderBy(sql, results);
    }
    
    // Handle LIMIT
    if (sql.toLowerCase().includes('limit')) {
      const limitMatch = sql.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        results = results.slice(0, parseInt(limitMatch[1]));
      }
    }
    
    return results;
  }

  handleJoins(sql, results) {
    const joinMatches = [...sql.matchAll(/join\s+(\w+)\s+(\w+)\s+on\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi)];
    
    joinMatches.forEach(match => {
      const [, joinTable, joinAlias, leftTable, leftCol, rightTable, rightCol] = match;
      const joinData = this.data[joinTable] || [];
      
      results = results.map(row => {
        const joined = joinData.find(j => j[rightCol] === row[leftCol]);
        if (joined) {
          Object.keys(joined).forEach(key => {
            if (key !== 'id') {
              row[`${key}`] = joined[key];
            }
          });
        }
        return row;
      });
    });
    
    return results;
  }

  handleWhere(sql, params, results, table) {
    const whereMatch = sql.match(/where\s+(.*?)(?:group by|order by|limit|$)/i);
    if (!whereMatch) return results;
    
    const whereClause = whereMatch[1].trim();
    
    return results.filter(row => {
      if (whereClause.includes('like')) {
        const colMatch = whereClause.match(/(\w+)\s+like\s+\?/i);
        if (colMatch) {
          const col = colMatch[1];
          const pattern = params[0];
          const value = String(row[col] || '');
          const searchTerm = pattern.replace(/%/g, '');
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
      }
      
      if (whereClause.includes('=')) {
        const colMatch = whereClause.match(/(\w+)\s*=\s*\?/i);
        if (colMatch) {
          const col = colMatch[1];
          return row[col] == params[0];
        }
        
        const literalMatch = whereClause.match(/(\w+)\s*=\s*'([^']+)'/i);
        if (literalMatch) {
          const [, col, value] = literalMatch;
          return row[col] == value;
        }
      }
      
      return true;
    });
  }

  handleAggregates(sql, results) {
    if (sql.toLowerCase().includes('count(*)')) {
      return [{ count: results.length }];
    }
    
    if (sql.toLowerCase().includes('sum(')) {
      const sumMatch = sql.match(/sum\((\w+)\)/i);
      if (sumMatch) {
        const col = sumMatch[1];
        const total = results.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
        return [{ total }];
      }
    }
    
    if (sql.toLowerCase().includes('group by')) {
      const groupMatch = sql.match(/group by\s+(\w+)/i);
      if (groupMatch) {
        const groupCol = groupMatch[1];
        const grouped = {};
        
        results.forEach(row => {
          const key = row[groupCol];
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(row);
        });
        
        return Object.keys(grouped).map(key => {
          const group = grouped[key];
          const result = { [groupCol]: key };
          
          if (sql.toLowerCase().includes('count(*)')) {
            result.count = group.length;
          }
          
          if (sql.toLowerCase().includes('sum(')) {
            const sumMatch = sql.match(/sum\((\w+)\)/i);
            if (sumMatch) {
              const col = sumMatch[1];
              result.earnings = group.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
            }
          }
          
          return result;
        });
      }
    }
    
    return results;
  }

  handleOrderBy(sql, results) {
    const orderMatch = sql.match(/order by\s+(\w+)(?:\s+(asc|desc))?/i);
    if (orderMatch) {
      const [, col, direction] = orderMatch;
      const dir = (direction || 'asc').toLowerCase();
      
      results.sort((a, b) => {
        const aVal = a[col];
        const bVal = b[col];
        
        if (aVal < bVal) return dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return results;
  }

  handleUpdate(sql, params) {
    const tableMatch = sql.match(/update\s+(\w+)/i);
    if (!tableMatch) return { changes: 0 };
    
    const table = tableMatch[1];
    const setMatch = sql.match(/set\s+(.*?)\s+where/i);
    const whereMatch = sql.match(/where\s+(.+)$/i);
    
    if (!setMatch || !whereMatch) return { changes: 0 };
    
    const setClauses = setMatch[1].split(',').map(s => s.trim());
    const whereClause = whereMatch[1].trim();
    
    let paramIndex = 0;
    const updates = {};
    setClauses.forEach(clause => {
      const [col] = clause.split('=').map(s => s.trim());
      updates[col] = params[paramIndex++];
    });
    
    const whereId = params[paramIndex];
    let changes = 0;
    
    this.data[table] = this.data[table].map(row => {
      if (whereClause.includes('id = ?') && row.id == whereId) {
        changes++;
        return { ...row, ...updates };
      }
      return row;
    });
    
    if (changes > 0) this.save();
    return { changes };
  }

  handleDelete(sql, params) {
    const tableMatch = sql.match(/delete from\s+(\w+)/i);
    if (!tableMatch) return { changes: 0 };
    
    const table = tableMatch[1];
    const whereMatch = sql.match(/where\s+(.+)$/i);
    
    if (!whereMatch) return { changes: 0 };
    
    const whereId = params[0];
    const initialLength = this.data[table].length;
    
    this.data[table] = this.data[table].filter(row => row.id != whereId);
    
    const changes = initialLength - this.data[table].length;
    if (changes > 0) this.save();
    
    return { changes };
  }

  async exec(sql) {
    // For CREATE TABLE statements, just return success
    return Promise.resolve();
  }

  close() {
    this.save();
  }
}

const db = new JSONDatabase();

export default db;
