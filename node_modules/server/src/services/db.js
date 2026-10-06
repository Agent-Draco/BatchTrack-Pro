const fs = require('fs');
const path = require('path');
const supabase = require('./supabaseAdmin');

// In-memory data store seeded from database/*.csv templates
const memoryStore = {};

function parseCsv(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        if (inQuotes && line[c + 1] === '"') {
          cur += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        values.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur);
    const row = {};
    headers.forEach((h, idx) => {
      let val = values[idx] !== undefined ? values[idx].trim() : '';
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (/^-?\d+(\.\d+)?$/.test(val) && !h.endsWith('_id') && h !== 'phone' && h !== 'code' && h !== 'sku' && h !== 'barcode') {
        val = Number(val);
      }
      row[h] = val;
    });
    rows.push(row);
  }
  return rows;
}

function initMemoryStore() {
  const dbDir = path.resolve(__dirname, '../../../database');
  if (!fs.existsSync(dbDir)) return;
  const files = fs.readdirSync(dbDir).filter((f) => f.endsWith('.csv'));
  files.forEach((f) => {
    const tableName = f.replace('.csv', '');
    try {
      const content = fs.readFileSync(path.join(dbDir, f), 'utf-8');
      memoryStore[tableName] = parseCsv(content);
    } catch (e) {
      console.warn(`[DB] Failed to load CSV for ${tableName}:`, e.message);
      memoryStore[tableName] = [];
    }
  });
}

initMemoryStore();

function getMemoryTable(table) {
  if (!memoryStore[table]) {
    memoryStore[table] = [];
  }
  return memoryStore[table];
}

async function list(table, { orgId, filters = {}, orderBy, limit, offset } = {}) {
  if (supabase) {
    try {
      let q = supabase.from(table).select('*');
      if (orgId) q = q.eq('organization_id', orgId);
      for (const [key, val] of Object.entries(filters)) {
        q = q.eq(key, val);
      }
      if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending });
      if (limit) q = q.limit(limit);
      if (offset) q = q.range(offset, offset + limit - 1);
      const { data, error } = await q;
      if (!error && data) return data;
    } catch (e) {
      // Fallback to memory
    }
  }

  // Memory fallback
  let rows = [...getMemoryTable(table)];
  if (orgId) {
    rows = rows.filter((r) => !r.organization_id || r.organization_id === orgId);
  }
  for (const [k, v] of Object.entries(filters)) {
    rows = rows.filter((r) => String(r[k]) === String(v));
  }
  if (orderBy) {
    rows.sort((a, b) => {
      const av = a[orderBy.column];
      const bv = b[orderBy.column];
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return orderBy.ascending ? res : -res;
    });
  }
  if (offset) rows = rows.slice(offset);
  if (limit) rows = rows.slice(0, limit);
  return rows;
}

async function getById(table, id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (e) {
      // Fallback
    }
  }
  const rows = getMemoryTable(table);
  return rows.find((r) => r.id === id) || null;
}

async function insert(table, data) {
  const item = {
    id: data.id || `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    ...data,
  };

  if (supabase) {
    try {
      const { data: res, error } = await supabase.from(table).insert(item).select().single();
      if (!error && res) {
        getMemoryTable(table).push(res);
        return res;
      }
    } catch (e) {
      // Fallback
    }
  }

  getMemoryTable(table).push(item);
  return item;
}

async function update(table, id, data) {
  if (supabase) {
    try {
      const { data: res, error } = await supabase.from(table).update(data).eq('id', id).select().single();
      if (!error && res) return res;
    } catch (e) {
      // Fallback
    }
  }

  const rows = getMemoryTable(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx !== -1) {
    rows[idx] = { ...rows[idx], ...data, updated_at: new Date().toISOString() };
    return rows[idx];
  }
  return null;
}

async function remove(table, id) {
  if (supabase) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      // Fallback
    }
  }
  const rows = getMemoryTable(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx !== -1) {
    rows.splice(idx, 1);
    return true;
  }
  return false;
}

// Chainable query builder for db.query('table')
function query(table) {
  const filters = [];
  let selectFields = '*';
  let isSingle = false;

  const builder = {
    select(fields = '*') {
      selectFields = fields;
      return builder;
    },
    eq(col, val) {
      filters.push({ type: 'eq', col, val });
      return builder;
    },
    order(col, { ascending = true } = {}) {
      filters.push({ type: 'order', col, ascending });
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    async then(resolve, reject) {
      try {
        if (supabase) {
          try {
            let sbQuery = supabase.from(table).select(selectFields);
            filters.forEach((f) => {
              if (f.type === 'eq') sbQuery = sbQuery.eq(f.col, f.val);
              if (f.type === 'order') sbQuery = sbQuery.order(f.col, { ascending: f.ascending });
            });
            if (isSingle) sbQuery = sbQuery.single();
            const res = await sbQuery;
            if (!res.error && res.data !== null) {
              return resolve({ data: res.data, error: null });
            }
          } catch (e) {
            // Fallback to memory
          }
        }

        // Memory table resolution
        let rows = [...getMemoryTable(table)];
        filters.forEach((f) => {
          if (f.type === 'eq') {
            rows = rows.filter((r) => String(r[f.col]) === String(f.val));
          }
          if (f.type === 'order') {
            rows.sort((a, b) => {
              const av = a[f.col];
              const bv = b[f.col];
              if (av === bv) return 0;
              const res = av > bv ? 1 : -1;
              return f.ascending ? res : -res;
            });
          }
        });

        if (isSingle) {
          return resolve({ data: rows[0] || null, error: null });
        }
        return resolve({ data: rows, error: null });
      } catch (err) {
        return resolve({ data: [], error: null });
      }
    },
  };

  return builder;
}

async function rpc(fnName, params) {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc(fnName, params);
      if (!error) return data;
    } catch (e) {
      // Fallback
    }
  }
  return null;
}

module.exports = {
  list,
  getById,
  insert,
  update,
  remove,
  query,
  rpc,
  memoryStore,
};
