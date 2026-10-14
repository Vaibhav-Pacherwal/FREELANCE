/**
 * Hand-drawn folk-art SVG decorative elements.
 * Botanical illustrations, birds, sunbursts, stars, and doodles
 * in the Latin American folk-art × Indian celebration style.
 */
import React from 'react';

export function FlowerMarigold({ size = 60, color = 'var(--marigold)', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className} aria-hidden="true">
      {/* Petals */}
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(0 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(45 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(90 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(135 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(180 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(225 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(270 30 30)" />
      <ellipse cx="30" cy="12" rx="7" ry="12" fill={color} transform="rotate(315 30 30)" />
      {/* Center */}
      <circle cx="30" cy="30" r="9" fill="var(--orange)" />
      <circle cx="30" cy="30" r="5" fill="var(--coral)" />
    </svg>
  );
}

export function FlowerSimple({ size = 45, color = 'var(--hot-magenta)', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" fill="none" className={className} aria-hidden="true">
      <ellipse cx="22.5" cy="8" rx="6" ry="10" fill={color} transform="rotate(0 22.5 22.5)" />
      <ellipse cx="22.5" cy="8" rx="6" ry="10" fill={color} transform="rotate(72 22.5 22.5)" />
      <ellipse cx="22.5" cy="8" rx="6" ry="10" fill={color} transform="rotate(144 22.5 22.5)" />
      <ellipse cx="22.5" cy="8" rx="6" ry="10" fill={color} transform="rotate(216 22.5 22.5)" />
      <ellipse cx="22.5" cy="8" rx="6" ry="10" fill={color} transform="rotate(288 22.5 22.5)" />
      <circle cx="22.5" cy="22.5" r="6" fill="var(--marigold)" />
    </svg>
  );
}

export function Leaf({ size = 40, color = 'var(--teal)', rotation = 0, className = '' }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 40 64" fill="none" className={className} aria-hidden="true"
      style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M20 2C8 18 2 32 6 48C10 56 16 60 20 62C24 60 30 56 34 48C38 32 32 18 20 2Z" fill={color} />
      <path d="M20 14V56" stroke="var(--cream)" strokeWidth="1.5" opacity="0.5" />
      <path d="M20 24L12 34M20 32L28 40M20 40L14 48" stroke="var(--cream)" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export function Bird({ size = 50, color = 'var(--teal-dark)', className = '', flip = false }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 50 30" fill="none" className={className} aria-hidden="true"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d="M5 20C8 12 14 6 22 4C28 3 32 6 35 10C38 6 42 4 48 5" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M22 4C20 8 19 12 20 16" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="25" cy="8" r="1.5" fill={color} />
      <path d="M28 7L32 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sunburst({ size = 80, color = 'var(--marigold)', className = '' }) {
  const rays = 16;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="12" fill={color} />
      {Array.from({ length: rays }).map((_, i) => {
        const angle = (360 / rays) * i;
        const innerR = 16;
        const outerR = i % 2 === 0 ? 36 : 28;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={40 + innerR * Math.cos(rad)}
            y1={40 + innerR * Math.sin(rad)}
            x2={40 + outerR * Math.cos(rad)}
            y2={40 + outerR * Math.sin(rad)}
            stroke={color}
            strokeWidth={i % 2 === 0 ? 3 : 2}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Star({ size = 24, color = 'var(--marigold)', className = '', filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2L14.9 8.6L22 9.5L17 14.4L18.2 22L12 18.5L5.8 22L7 14.4L2 9.5L9.1 8.6L12 2Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sparkle({ size = 20, color = 'var(--marigold)', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 0L11.5 7.5L20 10L11.5 12.5L10 20L8.5 12.5L0 10L8.5 7.5Z" fill={color} />
    </svg>
  );
}

export function WavyLine({ color = 'var(--ink)', className = '', width = '100%' }) {
  return (
    <svg width={width} height="12" viewBox="0 0 400 12" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M0 6C20 2 40 10 60 6C80 2 100 10 120 6C140 2 160 10 180 6C200 2 220 10 240 6C260 2 280 10 300 6C320 2 340 10 360 6C380 2 400 10 400 6"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleArrow({ size = 40, color = 'var(--ink)', rotation = 0, className = '' }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 40 32" fill="none" className={className} aria-hidden="true"
      style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M4 20C8 22 16 24 28 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M24 10L30 16L22 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HandDrawnCircle({ size = 100, color = 'var(--hot-magenta)', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <ellipse cx="50" cy="50" rx="42" ry="38" stroke={color} strokeWidth="2.5"
        strokeDasharray="4 3" transform="rotate(-5 50 50)" />
    </svg>
  );
}

export function DecorativeBorder({ color = 'var(--ink)', className = '' }) {
  return (
    <svg width="100%" height="20" viewBox="0 0 800 20" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M0 10L20 4L40 16L60 4L80 16L100 4L120 16L140 4L160 16L180 4L200 16L220 4L240 16L260 4L280 16L300 4L320 16L340 4L360 16L380 4L400 16L420 4L440 16L460 4L480 16L500 4L520 16L540 4L560 16L580 4L600 16L620 4L640 16L660 4L680 16L700 4L720 16L740 4L760 16L780 4L800 10"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export function PaperTearSVG({ color = 'var(--cream)', position = 'bottom', className = '' }) {
  const path = position === 'bottom'
    ? "M0,0 L0,35 C20,28 40,42 60,35 C80,28 100,45 120,35 C140,25 160,40 180,32 C200,24 220,42 240,35 C260,28 280,40 300,30 C320,20 340,42 360,35 C380,28 400,40 400,35 L400,0 Z"
    : "M0,45 L0,10 C20,18 40,2 60,10 C80,18 100,0 120,10 C140,20 160,5 180,13 C200,21 220,3 240,10 C260,18 280,5 300,15 C320,25 340,3 360,10 C380,18 400,5 400,10 L400,45 Z";

  return (
    <svg width="100%" height="45" viewBox="0 0 400 45" preserveAspectRatio="none" className={className} aria-hidden="true"
      style={{ display: 'block' }}>
      <path d={path} fill={color} />
    </svg>
  );
}
