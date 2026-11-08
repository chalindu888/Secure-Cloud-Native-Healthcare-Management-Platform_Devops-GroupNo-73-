import React from 'react';

// Outline icons for the dashboard stat cards. Each draws in the colour it is given (currentColor)
// on a 48x48 grid, so they stay sharp at any size.

const Svg = ({ size = 48, color, children }) => (
  <svg
    width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color }}
  >
    {children}
  </svg>
);

// Stack of folders with a "new request" signal dot
export const PendingFoldersIcon = (props) => (
  <Svg {...props}>
    <path d="M9 36V11a2 2 0 0 1 2-2h7l3 3h8a2 2 0 0 1 2 2v3" />
    <path d="M13 38V16a2 2 0 0 1 2-2h7l3 3h8a2 2 0 0 1 2 2v3" />
    <path d="M13 38l3.2-12.4A2 2 0 0 1 18.1 24H33l1.6 0.2a2 2 0 0 1 1.9 2.5L33.9 36.6A2 2 0 0 1 32 38z" />
    <path d="M37 27.5a5 5 0 0 1 0 7" />
    <path d="M40.5 25a8.5 8.5 0 0 1 0 12" />
    <circle cx="35" cy="31" r="2.4" fill="#f97316" stroke="none" />
  </Svg>
);

// Chain of linked hexagons, each ticked: the confirmed queue
const hexagon = (cx) => `M${cx} 16l7 4v8l-7 4-7-4v-8z`;
export const ConfirmedQueueIcon = (props) => (
  <Svg {...props}>
    {[11, 24, 37].map((cx) => (
      <React.Fragment key={cx}>
        <path d={hexagon(cx)} />
        <path d={`M${cx - 3} 24.2l2.3 2.3 4-4.4`} />
      </React.Fragment>
    ))}
  </Svg>
);

// Stethoscope curling around a person: treated patients
export const TreatedPatientsIcon = (props) => (
  <Svg {...props}>
    <circle cx="24" cy="12" r="3.2" fill="currentColor" stroke="none" />
    <path d="M12 16c3.5 1 7 4.5 8.6 9 0.8 2.2 1.9 3.2 3.4 3.2s2.6-1 3.4-3.2C29 20.5 32.5 17 36 16c-1 6-3 11.5-6 15" />
    <path d="M18 31c1.5 2 3.7 3 6 3" />
    <path d="M10 13c-1.5 2-1.5 5 0 7M38 13c1.5 2 1.5 5 0 7" />
    <path d="M24 28.2v6.3c0 4.5 3.2 7.5 7.2 7.5s7.3-3 7.3-7.5V31" />
    <circle cx="38.5" cy="28" r="3" />
  </Svg>
);

// Coin with a dollar sign and a rising arrow: consultation fee
export const FeeGrowthIcon = (props) => (
  <Svg {...props}>
    <circle cx="19" cy="29" r="12" />
    <circle cx="19" cy="29" r="8.6" strokeDasharray="1 3" />
    <path d="M22.6 24.8c-0.9-1.4-2.7-1.9-4.2-1.4-2 0.7-2 3 0.2 3.6l2.8 0.8c2.2 0.7 2.2 3.1 0.2 3.7-1.6 0.5-3.4 0-4.4-1.3" />
    <path d="M19 21.5v2M19 32.5v2" />
    <path d="M28 21l11-11" />
    <path d="M31 9.5h8.5V18" />
  </Svg>
);
