import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  textColor?: string;
  showText?: boolean;
}

export default function Logo({ className = '', size = 48, textColor = 'text-white', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="joudcon-brand-logo">
      {/* Precision Rotated Diamond SVG Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-300 hover:rotate-6"
        referrerPolicy="no-referrer"
      >
        {/* Rounded external diamond border (45deg rotated container with rounded corners) */}
        <rect
          x="15"
          y="15"
          width="70"
          height="70"
          rx="12"
          transform="rotate(45 50 50)"
          stroke="#53678F"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="72 12 22 12 180"
          className="stroke-[#53678F]"
        />

        {/* Outer Orange Dot (Top right) */}
        <circle cx="70" cy="22" r="8" fill="#FBB040" />

        {/* Blue Inner Abstract Silhouette J/N path */}
        <path
          d="M 60 32 
             C 65 32, 70 36, 70 42 
             C 70 54, 52 65, 45 78 
             C 43 82, 38 82, 36 78 
             C 34 74, 34 54, 34 46 
             C 34 42, 38 40, 42 40 
             C 48 40, 52 44, 46 54
             C 44 58, 44 64, 48 64
             C 52 64, 58 46, 60 32 Z"
          fill="#53678F"
          stroke="#53678F"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Inner Orange Dot */}
        <circle cx="50" cy="60" r="6" fill="#FBB040" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-sans tracking-[0.18em] text-xl font-extrabold ${textColor}`}>
            JOUD<span className="text-[#FBB040]">CON</span>
          </span>
          <span className="text-[0.62rem] tracking-[0.38em] uppercase text-gray-400 font-medium mt-0.5">
            Event Portfolio
          </span>
        </div>
      )}
    </div>
  );
}
