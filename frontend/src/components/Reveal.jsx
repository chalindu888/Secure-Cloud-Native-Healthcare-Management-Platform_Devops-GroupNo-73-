import React, { useEffect, useRef, useState } from 'react';

const canAnimate = () =>
  typeof window !== 'undefined' &&
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Slides / fades its content into place the first time it scrolls into view.
// direction: 'up' | 'left' | 'right' | 'zoom'. `delay` (ms) staggers siblings.
const Reveal = ({ as: Tag = 'div', direction = 'up', delay = 0, className = '', style, children, ...rest }) => {
  const ref = useRef(null);
  // Skip the effect entirely when the browser can't (or shouldn't) animate
  const [visible, setVisible] = useState(() => !canAnimate());

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${direction}${visible ? ' is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms', ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
