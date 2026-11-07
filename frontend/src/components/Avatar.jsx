import React from 'react';

const initialsOf = (name = '') =>
  name.replace(/^dr\.?\s*/i, '').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

// Round profile picture that falls back to the person's initials
const Avatar = ({ name, src, size = '3rem', gradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)' }) => (
  <div
    style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: gradient, color: '#fff', fontWeight: 800, fontSize: `calc(${size} * 0.34)`,
    }}
  >
    {src ? (
      <img src={src} alt={`${name || 'Patient'} profile`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    ) : (
      initialsOf(name)
    )}
  </div>
);

export default Avatar;
