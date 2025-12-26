import React from 'react';

export default function CommunityMainIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cyberlife-fab-neon" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#00fff7" />
          <stop offset="60%" stopColor="#00d9ff" />
          <stop offset="100%" stopColor="#e322bc" />
        </radialGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#cyberlife-fab-neon)" filter="url(#glow)" />
      <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.93">
        <circle cx="24" cy="24" r="7.5" fill="none" />
        <path d="M24 16.5v-3.5M24 35v-3.5M31.5 24h3.5M13 24h3.5" />
        <circle cx="24" cy="13" r="1.5" fill="#fff" />
        <circle cx="24" cy="35" r="1.5" fill="#fff" />
        <circle cx="35" cy="24" r="1.5" fill="#fff" />
        <circle cx="13" cy="24" r="1.5" fill="#fff" />
      </g>
    </svg>
  );
}
