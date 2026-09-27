import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button.jsx';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  showClose = true,
  closeOnBackdrop = true,
  className = '',
  ...props
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const node = (
    <div
      className="ui-modal-overlay"
      onClick={() => closeOnBackdrop && onClose?.()}
    >
      <div
        className={`ui-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'ui-modal-title' : undefined}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {(title || showClose) && (
          <div className="ui-modal-header">
            {title && (
              <div id="ui-modal-title" className="ui-modal-title">
                {title}
              </div>
            )}
            {showClose && (
              <button
                type="button"
                className="ui-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="ui-modal-body">{children}</div>
        {footer !== undefined ? (
          footer
        ) : (
          <div className="ui-modal-footer">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
}

/*
Example usage:
  const [open, setOpen] = useState(false);
  <Button onClick={() => setOpen(true)}>Open</Button>
  <Modal
    open={open}
    onClose={() => setOpen(false)}
    title="Confirm Action"
    footer={
      <div className="ui-modal-footer">
        <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        <Button variant="danger" onClick={confirm}>Delete</Button>
      </div>
    }
  >
    <p>Are you sure?</p>
  </Modal>
*/
