import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// Note: the global reset in index.css zeroes Tailwind padding/margin utilities,
// so spacing here uses inline styles.
const Modal = ({ isOpen, onClose, title, children, maxWidth = '36rem' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ position: 'fixed', inset: 0 }} onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth, overflow: 'hidden',
          background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', overflowWrap: 'anywhere' }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              display: 'flex', padding: '0.4rem', borderRadius: '0.6rem', border: 'none',
              background: 'transparent', color: '#64748b', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
