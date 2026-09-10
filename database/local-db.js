(function (global) {
  'use strict';

  const DB_NAME = 'batchtrack_local_db';
  const DB_VERSION = 1;
  const TABLES = ['retailers', 'consumers', 'machines', 'inventory', 'transactions', 'sessions'];
  let connectionPromise = null;

  function open() {
    if (connectionPromise) return connectionPromise;

    connectionPromise = new Promise((resolve, reject) => {
      if (!global.indexedDB) {
        reject(new Error('IndexedDB is not available in this browser.'));
        return;
      }

      const request = global.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        const db = request.result;
        TABLES.forEach((table) => {
          if (!db.objectStoreNames.contains(table)) {
            db.createObjectStore(table, { keyPath: 'id' });
          }
        });
      };
      request.onsuccess = function () {
        const db = request.result;
        db.onversionchange = function () {
          db.close();
          connectionPromise = null;
        };
        resolve(db);
      };
      request.onerror = function () {
        connectionPromise = null;
        reject(request.error || new Error('Unable to open the local database.'));
      };
      request.onblocked = function () {
        connectionPromise = null;
        reject(new Error('The local database is blocked by another browser tab.'));
      };
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
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction(table, 'readonly').objectStore(table).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error(`Unable to read ${table}.`));
    });
  }

  async function put(table, record) {
    assertTable(table);
    if (!record || !record.id) throw new Error(`A record id is required for ${table}.`);
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction(table, 'readwrite').objectStore(table).put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error || new Error(`Unable to write ${table}.`));
    });
  }

  async function remove(table, id) {
    assertTable(table);
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction(table, 'readwrite').objectStore(table).delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error || new Error(`Unable to delete from ${table}.`));
    });
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
