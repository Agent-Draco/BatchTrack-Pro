import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

const ToastContext = createContext(null);
const AUTO_DISMISS_MS = 2400;

let singletonPush = null;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return {
    push: (msg, type) => singletonPush?.(msg, type),
    success: (msg) => singletonPush?.(msg, 'success'),
    error: (msg) => singletonPush?.(msg, 'error'),
    info: (msg) => singletonPush?.(msg, 'info'),
  };
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 200);
    const tm = timersRef.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      setToasts((list) => [...list, { id, message, type }]);
      const tm = setTimeout(() => remove(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, tm);
      return id;
    },
    [remove]
  );

  const success = useCallback((m) => push(m, 'success'), [push]);
  const error = useCallback((m) => push(m, 'error'), [push]);
  const info = useCallback((m) => push(m, 'info'), [push]);

  const api = {
    push,
    remove,
    success,
    error,
    info,
  };

  useEffect(() => {
    singletonPush = push;
    try {
      const win = typeof window !== 'undefined' ? window : globalThis;
      win.__batchtrackToast = api;
    } catch {
      /* noop */
    }
    return () => {
      singletonPush = null;
      try {
        const win = typeof window !== 'undefined' ? window : globalThis;
        if (win.__batchtrackToast === api) win.__batchtrackToast = null;
      } catch {
        /* noop */
      }
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [push, remove, success, error, info]);

  const icons = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
  };

  const host = (
    <ToastContext.Provider value={api}>
      <React.Fragment />
      <div className="ui-toast-host" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`ui-toast ${t.type}${t.leaving ? ' leaving' : ''}`}
            role="status"
          >
            <span className="ui-toast-icon">{icons[t.type] || icons.info}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              style={{
                background: 'none',
                border: 0,
                color: 'inherit',
                opacity: 0.7,
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '13px',
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );

  if (typeof document !== 'undefined') {
    return ReactDOM.createPortal(host, document.body);
  }
  return host;
}

/*
Example usage:
  // App root: <ToastHost />
  // In any component:
  const toast = useToast();
  toast.success('Product saved!');
  toast.error('Failed to save.');
  toast.info('Scanning in progress…');
  const id = toast.push('Custom', 'success');
  toast.remove(id);
*/
