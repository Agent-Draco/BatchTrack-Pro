(function (global) {
  'use strict';

  // 1. Supabase Configuration
  global.BATCHTRACK_SUPABASE_CONFIG = global.BATCHTRACK_SUPABASE_CONFIG || {
    url: 'https://bwiytslmkiyzdaijjtka.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJid2l5dHNsbWtpeXpkYWlqdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDcxOTYsImV4cCI6MjEwNDYyMzE5Nn0.Rke5rXqI5bS9lRbwsW5lXLyCWe2qhWkY6-pCMZqbM6o'
  };

  global.batchTrackConfigReady = fetch('/api/config')
    .then((response) => (response.ok ? response.json() : null))
    .then((config) => {
      if (config?.url && config?.anonKey) {
        global.BATCHTRACK_SUPABASE_CONFIG = config;
      }
      return global.BATCHTRACK_SUPABASE_CONFIG;
    })
    .catch(() => global.BATCHTRACK_SUPABASE_CONFIG);

  // 2. ZXing Async Dynamic Import
  global.zxingReady = (function () {
    if (global.ZXingBrowser) return Promise.resolve(global.ZXingBrowser);
    return import('https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/+esm')
      .then((module) => {
        global.ZXingBrowser = module;
        return module;
      })
      .catch((error) => {
        console.error('ZXing failed to load:', error);
        return null;
      });
  })();

  // 3. View Mode (Desktop / Phone presentation)
  function getViewMode() {
    return localStorage.getItem('batchtrack_view_mode') || 'desktop';
  }

  function applyViewMode() {
    const mode = getViewMode();
    document.body.classList.toggle('phone-mode', mode === 'phone');
  }

  function toggleViewMode() {
    const current = getViewMode();
    const next = current === 'phone' ? 'desktop' : 'phone';
    localStorage.setItem('batchtrack_view_mode', next);
    applyViewMode();
    document.querySelectorAll('[data-mode-toggle] span').forEach((label) => {
      label.textContent = next === 'phone' ? 'Desktop view' : 'Phone view';
    });
  }

  function modeControl() {
    const isPhone = getViewMode() === 'phone';
    return `<button class="mode-toggle" type="button" data-mode-toggle aria-label="Switch between desktop and phone mode"><span>${isPhone ? 'Desktop view' : 'Phone view'}</span></button>`;
  }

  // 4. Session Persistence
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('batchtrack_session') || 'null');
    } catch (err) {
      return null;
    }
  }

  function saveSession(session) {
    if (session) {
      localStorage.setItem('batchtrack_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('batchtrack_session');
    }
  }

  // 5. Toast Notifications
  let toastTimer = null;
  function showToast(message) {
    let toastNode = document.getElementById('toast');
    if (!toastNode) {
      toastNode = document.createElement('div');
      toastNode.id = 'toast';
      toastNode.className = 'toast';
      document.body.appendChild(toastNode);
    }
    toastNode.textContent = message;
    toastNode.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.classList.remove('show'), 2400);
  }

  // 6. Formatting & String Helpers
  function uid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[c]));
  }

  function initials(value) {
    return (String(value || 'B').split(/\s+/).map((part) => part[0]).join('').slice(0, 2) || 'B').toUpperCase();
  }

  function formatCurrency(value) {
    const num = Number(value || 0);
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  // 7. Aztec & WADN Specifications
  const TRACKLY_CATEGORIES = ['pharma', 'consumables', 'electronics'];

  function normalizeCategory(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized.includes('pharm') || normalized.includes('medic')) return 'pharma';
    if (normalized.includes('elect') || normalized.includes('gadget') || normalized.includes('device')) return 'electronics';
    if (normalized.includes('consum') || normalized.includes('food') || normalized.includes('grocery')) return 'consumables';
    return TRACKLY_CATEGORIES.includes(normalized) ? normalized : 'consumables';
  }

  function parseAztecPayload(text) {
    const parts = String(text || '').trim().split('|');
    if (parts[0] !== 'AZT' || parts.length < 7) return null;
    return {
      wadn: parts[1],
      category: normalizeCategory(parts[2]),
      batchNumber: parts[3],
      price: Number(parts[4]) || 0,
      expiry: parts[5],
      warrantyMonths: Number(parts[6]) || 0
    };
  }

  function aztecPayload(item) {
    return [
      'AZT',
      item.wadn,
      normalizeCategory(item.category),
      item.batchNumber,
      Number(item.price || 0),
      item.expiry || '',
      Number(item.warrantyMonths || 0)
    ].join('|');
  }

  function qrPayload(item) {
    return JSON.stringify({
      wadn: item.wadn,
      batch: item.batchNumber,
      cat: normalizeCategory(item.category),
      exp: item.expiry || ''
    });
  }

  function warrantyExpiry(item, fromDate = new Date()) {
    const start = new Date(item.mfgDate || item.purchaseDate || fromDate);
    const months = Number(item.warrantyMonths || item.warranty || 0);
    if (!months || Number.isNaN(start.getTime())) return '';
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry.toISOString().slice(0, 10);
  }

  // 8. Database Helpers (wrapper around window.BatchTrackDB)
  async function readTable(name) {
    if (!global.BatchTrackDB) throw new Error('Database adapter not initialized');
    return global.BatchTrackDB.read(name);
  }

  async function writeTable(name, value) {
    if (!global.BatchTrackDB) throw new Error('Database adapter not initialized');
    return global.BatchTrackDB.put(name, value);
  }

  async function deleteTableItem(name, id) {
    if (!global.BatchTrackDB) throw new Error('Database adapter not initialized');
    return global.BatchTrackDB.remove(name, id);
  }

  async function findByTable(name, predicate) {
    const list = await readTable(name);
    return list.find(predicate) || null;
  }

  async function loadAllData() {
    const [retailers, consumers, machines, inventory, transactions, documents, creditNotes, supportTickets] = await Promise.all([
      readTable('retailers'),
      readTable('consumers'),
      readTable('machines'),
      readTable('inventory'),
      readTable('transactions'),
      readTable('documents'),
      readTable('credit_notes'),
      readTable('support_tickets')
    ]);
    return {
      retailers: retailers || [],
      consumers: consumers || [],
      machines: machines || [],
      inventory: inventory || [],
      transactions: transactions || [],
      documents: documents || [],
      creditNotes: creditNotes || [],
      supportTickets: supportTickets || []
    };
  }

  // 9. Camera Multi-format & QR Scanner Modal
  async function startQrScanner(onScan) {
    const modal = document.createElement('div');
    modal.className = 'scanner-modal active';
    modal.innerHTML = `
      <div class="scanner-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0;">Scan QR or Aztec</h3>
          <button class="btn" type="button" data-close-scanner>Close</button>
        </div>
        <video id="scanner-video" autoplay playsinline muted></video>
        <div style="margin-top:12px; text-align:center; color:var(--muted); font-size:13px;">Point the camera at an Aztec or QR label.</div>
      </div>
    `;
    document.body.appendChild(modal);

    const video = modal.querySelector('#scanner-video');
    let stream = null;
    let controls = null;
    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;
      try { controls?.stop?.(); } catch (e) {}
      try { stream?.getTracks().forEach((track) => track.stop()); } catch (e) {}
      modal.remove();
    };

    modal.querySelector('[data-close-scanner]').addEventListener('click', close);

    const handleDecodedText = (text, format) => {
      if (closed || !text) return;
      const aztec = parseAztecPayload(text);
      if (aztec) {
        close();
        if (onScan) {
          onScan(aztec, text);
          return;
        }
        showToast(`Aztec matched: ${aztec.wadn}`);
        return;
      }

      let payload;
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = { batch: text.trim() };
      }

      if (!payload.batch && !payload.wadn) {
        showToast(`${format || 'Barcode'} does not contain a recognized item.`);
        return;
      }

      const decodedItem = {
        wadn: payload.wadn || '',
        batchNumber: payload.batch || '',
        category: normalizeCategory(payload.cat),
        expiry: payload.exp || '',
        price: Number(payload.price || 0),
        warrantyMonths: Number(payload.warrantyMonths || 0)
      };

      close();
      if (onScan) {
        onScan(decodedItem, text);
      } else {
        showToast(`Code matched: ${decodedItem.batchNumber || decodedItem.wadn}`);
      }
    };

    try {
      const zxing = await (global.zxingReady || Promise.resolve(global.ZXingBrowser));
      if (zxing?.BrowserMultiFormatReader) {
        const reader = new zxing.BrowserMultiFormatReader();
        controls = await reader.decodeFromVideoDevice(undefined, video, (result, error) => {
          if (result) handleDecodedText(result.getText(), result.getBarcodeFormat?.());
        });
        return;
      }
      throw new Error('Multi-format scanner library did not load.');
    } catch (error) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const tick = () => {
          if (closed) return;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = global.jsQR?.(imageData.data, canvas.width, canvas.height);
          if (code) {
            handleDecodedText(code.data, 'QR');
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch (cameraError) {
        close();
        showToast('Camera access failed. Allow camera access and try again.');
        console.error('BatchTrack scanner error:', cameraError);
      }
    }
  }

  // Export to global scope
  global.BatchTrackCommon = Object.freeze({
    getViewMode,
    applyViewMode,
    toggleViewMode,
    modeControl,
    getSession,
    saveSession,
    showToast,
    uid,
    escapeHtml,
    initials,
    formatCurrency,
    TRACKLY_CATEGORIES,
    normalizeCategory,
    parseAztecPayload,
    aztecPayload,
    qrPayload,
    warrantyExpiry,
    readTable,
    writeTable,
    deleteTableItem,
    findByTable,
    loadAllData,
    startQrScanner
  });

  // Global listener for mode toggles
  document.addEventListener('click', (event) => {
    const target = event.target.closest ? event.target.closest('[data-mode-toggle]') : event.target;
    if (target?.matches?.('[data-mode-toggle]')) {
      toggleViewMode();
    }
  });

  // Apply initial view mode
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyViewMode);
  } else {
    applyViewMode();
  }
})(window);
