(function (global) {
  'use strict';

  const DB_NAME = 'batchtrack_supabase';
  const DB_VERSION = 3;
  const TABLES = [
    'retailers',
    'consumers',
    'machines',
    'inventory',
    'transactions',
    'documents',
    'credit_notes',
    'support_tickets',
    'sessions'
  ];
  let connectionPromise = null;

  function open() {
    if (connectionPromise) return connectionPromise;

    connectionPromise = Promise.resolve().then(() => {
      const config = global.BATCHTRACK_SUPABASE_CONFIG || {};
      if (!global.supabase?.createClient || !config.url || !config.anonKey) {
        throw new Error('Supabase client configuration is missing.');
      }
      return global.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });

    return connectionPromise;
  }

  function assertTable(table) {
    if (!TABLES.includes(table)) {
      throw new Error(`Unknown local database table: ${table}`);
    }
  }

  async function read(table) {
    assertTable(table);
    const client = await open();
    const { data, error } = await client.from(table).select('record').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => row.record);
  }

  async function put(table, record) {
    assertTable(table);
    if (!record || !record.id) throw new Error(`A record id is required for ${table}.`);
    const client = await open();
    const { error } = await client.from(table).upsert({ id: String(record.id), record, updated_at: new Date().toISOString() });
    if (error) throw error;
    return record;
  }

  async function remove(table, id) {
    assertTable(table);
    const client = await open();
    const { error } = await client.from(table).delete().eq('id', String(id));
    if (error) throw error;
    return true;
  }

  async function find(table, predicate) {
    const records = await read(table);
    return records.find(predicate) || null;
  }

  global.BatchTrackDB = Object.freeze({
    name: DB_NAME,
    version: DB_VERSION,
    tables: TABLES.slice(),
    open,
    read,
    put,
    remove,
    find
  });
})(window);
