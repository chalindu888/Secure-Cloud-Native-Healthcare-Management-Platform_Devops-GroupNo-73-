import React from 'react';

// Floating "Contact us" button (bottom-right on every page) that opens the hospital's WhatsApp channel.
// Inline styles are used because the global reset in index.css zeroes Tailwind spacing utilities.
export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbEBdER3bbV3PXD9yu3p';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" width="34" height="34" fill="#ffffff" aria-hidden="true">
    <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 28l7.14-1.87a12 12 0 0 0 4.9 1.04h.01C22.7 27.17 28 21.77 28 15.13 28 11.92 26.75 8.9 24.48 6.64A11.9 11.9 0 0 0 16.04 3zm0 21.97h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.76.98 1-3.66-.24-.38a9.9 9.9 0 0 1-1.52-5.28c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.14 1.03 7.01 2.91a9.86 9.86 0 0 1 2.9 7.03c0 5.48-4.46 9.93-9.92 9.93zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
  </svg>
);

const WhatsAppButton = () => (
  <a
    href={WHATSAPP_CHANNEL_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-float"
    aria-label="Contact us: follow the HealthOps Hospital channel on WhatsApp"
    style={{
      position: 'fixed', right: '1.25rem', bottom: '1.25rem', zIndex: 60,
      display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none',
    }}
  >
    <span
      className="whatsapp-float-label"
      style={{
        padding: '0.6rem 1.1rem', borderRadius: '999px', background: '#ffffff', color: '#1f2937',
        fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      }}
    >
      Contact us
    </span>
    <span
      style={{
        width: '3.75rem', height: '3.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#25d366', boxShadow: '0 8px 22px rgba(37,211,102,0.45)',
      }}
    >
      <WhatsAppIcon />
    </span>
  </a>
);

export default WhatsAppButton;
