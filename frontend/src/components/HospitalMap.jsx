import React from 'react';

// Floor plan of the hospital building. Each floor has a corridor with rooms along both sides;
// room positions come from the database (viewBox 0 0 100 60).
//
// - markers: [{ roomId, label, color }] pins on rooms (where a patient is)
// - onSelectRoom: makes rooms clickable (used to pick a room for an admission)
// - showOccupancy: colour rooms by how many beds are free

const INK = '#0f172a';

export const floorName = (floor) => `Floor ${floor}`;

// Plain-words directions for a room, from the lift
export const describeRoom = (room) => {
  if (!room) return '';
  const north = room.y < 30;
  const position = Math.round((room.x - 14) / 17) + 1;
  const ordinal = ['1st', '2nd', '3rd', '4th', '5th'][position - 1] || `${position}th`;
  return `Take the lift to ${floorName(room.floor)}, then walk along the corridor. It is the ${ordinal} room on the ${north ? 'north (top)' : 'south (bottom)'} side.`;
};

const wrap = (text, max = 13) => {
  const lines = [];
  text.split(' ').forEach((word) => {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + word).length <= max) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  });
  return lines.slice(0, 3);
};

const occupancyColor = (room) => {
  const free = room.beds - (room.occupiedBeds?.length || 0);
  if (free === 0) return { fill: '#fee2e2', stroke: '#f87171' };
  if (free < room.beds) return { fill: '#fef3c7', stroke: '#fbbf24' };
  return { fill: '#dcfce7', stroke: '#4ade80' };
};

export const OccupancyLegend = () => (
  <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', margin: 0, padding: 0, listStyle: 'none', fontSize: '0.78rem', color: '#475569' }}>
    {[['#dcfce7', '#4ade80', 'All beds free'], ['#fef3c7', '#fbbf24', 'Some beds free'], ['#fee2e2', '#f87171', 'Full']].map(([fill, stroke, label]) => (
      <li key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ width: '0.9rem', height: '0.9rem', borderRadius: '0.25rem', background: fill, border: `1.5px solid ${stroke}` }} /> {label}
      </li>
    ))}
  </ul>
);

const HospitalMap = ({ rooms, floor, markers = [], selectedRoomId = null, onSelectRoom, showOccupancy = false }) => {
  const floorRooms = rooms.filter((r) => r.floor === floor);
  const markerByRoom = new Map();
  markers.forEach((m) => {
    if (!markerByRoom.has(m.roomId)) markerByRoom.set(m.roomId, []);
    markerByRoom.get(m.roomId).push(m);
  });
  const interactive = typeof onSelectRoom === 'function';

  return (
    <svg
      viewBox="0 0 100 60"
      role="img"
      aria-label={`Floor plan of ${floorName(floor)}`}
      style={{ display: 'block', width: '100%', height: 'auto', background: '#f1f5f9', borderRadius: '0.9rem', border: '1px solid #e2e8f0' }}
    >
      {/* Corridor and lift */}
      <rect x="13" y="25" width="86" height="10" fill="#e2e8f0" />
      <text x="56" y="31.4" textAnchor="middle" fontSize="2.2" fill="#64748b" fontWeight="700" style={{ letterSpacing: '0.3px' }}>CORRIDOR</text>
      <rect x="2" y="20" width="10" height="20" rx="1.2" fill="#c7d2fe" stroke="#818cf8" strokeWidth="0.4" />
      <text x="7" y="29" textAnchor="middle" fontSize="2.4" fill="#3730a3" fontWeight="800">LIFT</text>
      <text x="7" y="32.4" textAnchor="middle" fontSize="2" fill="#3730a3">&amp; stairs</text>

      {floorRooms.map((room) => {
        const colors = showOccupancy ? occupancyColor(room) : { fill: '#ffffff', stroke: '#94a3b8' };
        const selected = room.id === selectedRoomId;
        const here = markerByRoom.get(room.id) || [];
        const lines = wrap(room.name);
        const free = room.beds - (room.occupiedBeds?.length || 0);
        const handle = () => onSelectRoom(room);
        return (
          <g
            key={room.id}
            onClick={interactive ? handle : undefined}
            onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); } } : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `Room ${room.code}, ${room.name}, ${free} of ${room.beds} beds free` : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default', outline: 'none' }}
          >
            <rect
              x={room.x} y={room.y} width={room.w} height={room.h} rx="1"
              fill={here.length > 0 ? '#e0e7ff' : colors.fill}
              stroke={selected ? '#4f46e5' : here.length > 0 ? '#4f46e5' : colors.stroke}
              strokeWidth={selected || here.length > 0 ? 1 : 0.4}
            />
            <text x={room.x + room.w / 2} y={room.y + 4.6} textAnchor="middle" fontSize="3.4" fontWeight="800" fill={INK}>{room.code}</text>
            {lines.map((line, i) => (
              <text key={line + i} x={room.x + room.w / 2} y={room.y + 8 + i * 2.3} textAnchor="middle" fontSize="1.9" fill="#334155">{line}</text>
            ))}
            {showOccupancy && (
              <text x={room.x + room.w / 2} y={room.y + room.h - 1.6} textAnchor="middle" fontSize="1.9" fontWeight="700" fill="#475569">{free}/{room.beds} beds free</text>
            )}
            {here.map((m, i) => {
              const cx = room.x + room.w / 2 + (i - (here.length - 1) / 2) * 5;
              const cy = room.y + room.h - (showOccupancy ? 6.2 : 4.6);
              return (
                <g key={`${m.label}-${i}`}>
                  <circle cx={cx} cy={cy} r="2" fill={m.color || '#4f46e5'} opacity="0.35">
                    <animate attributeName="r" values="2;4.2;2" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r="2.1" fill={m.color || '#4f46e5'} stroke="#ffffff" strokeWidth="0.5" />
                  <text x={cx} y={cy + 0.8} textAnchor="middle" fontSize="2.2" fontWeight="800" fill="#ffffff">{m.label}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

export default HospitalMap;
