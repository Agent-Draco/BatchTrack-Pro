const supabase = require('./supabaseAdmin');

async function list(table, { orgId, filters = {}, orderBy, limit, offset } = {}) {
  let query = supabase.from(table).select('*');
  if (orgId) {
    query = query.eq('organization_id', orgId);
  }
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending });
  }
  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.range(offset, offset + limit - 1);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

async function getById(table, id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

async function insert(table, data) {
  const { data: result, error } = await supabase.from(table).insert(data).select().single();
  if (error) throw new Error(error.message);
  return result;
}

async function update(table, id, data) {
  const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return result;
}

async function remove(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

function query(table) {
  return supabase.from(table);
}

async function rpc(fnName, params) {
  const { data, error } = await supabase.rpc(fnName, params);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  list,
  getById,
  insert,
  update,
  remove,
  query,
  rpc
};
