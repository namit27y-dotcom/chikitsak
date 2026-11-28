import React from 'react';

export const ChikitsakLogoMark: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Left botanical leaf */}
    <path
      d="M27 31C16 29 10 21 11 10C22 10 29 17 30 29"
      fill="#4D8B62"
    />
    {/* Center tall botanical leaf */}
    <path
      d="M32 29C26 19 28 9 37 4C44 12 43 23 35 31"
      fill="#153D32"
    />
    {/* Right botanical leaf */}
    <path
      d="M36 33C44 26 53 26 57 32C51 39 42 40 35 36"
      fill="#75AE7D"
    />
    {/* Medical cross badge */}
    <rect x="20" y="25" width="24" height="24" rx="6" fill="#FFFFFF" />
    <path
      d="M29 29H35V34H40V40H35V45H29V40H24V34H29V29Z"
      fill="#153D32"
    />
  </svg>
);

export const ChikitsakMobileMark: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Green cross with leaf tip matching mobile reference */}
    <path
      d="M19 8H29V18H39V28H29V38H19V28H9V18H19V8Z"
      fill="#1E6B47"
    />
    <path
      d="M26 9C31 9 35 12 37 17C32 18 28 15 26 9Z"
      fill="#4D9B69"
    />
    <path
      d="M24 17.5L25.4 21.6L29.5 23L25.4 24.4L24 28.5L22.6 24.4L18.5 23L22.6 21.6L24 17.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const MedicalShieldIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24',
}) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="shieldGreen" x1="32" y1="22" x2="88" y2="96" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B935E" />
        <stop offset="100%" stopColor="#1B643D" />
      </linearGradient>
    </defs>
    {/* Soft outer white-green glow halo */}
    <circle cx="60" cy="58" r="42" fill="#FFFFFF" fillOpacity="0.65" />
    <circle cx="60" cy="58" r="34" fill="#DCE9DC" fillOpacity="0.65" />
    {/* Medical Shield */}
    <path
      d="M60 22L88 33V57C88 76.5 75.8 92.2 60 98C44.2 92.2 32 76.5 32 57V33L60 22Z"
      fill="url(#shieldGreen)"
    />
    <path
      d="M60 26.5L83.5 35.8V56.8C83.5 73.5 73.2 87.2 60 92.5V26.5Z"
      fill="#155333"
      fillOpacity="0.35"
    />
    {/* Crisp White Medical Cross */}
    <rect x="55" y="42" width="10" height="30" rx="2" fill="#FFFFFF" />
    <rect x="45" y="52" width="30" height="10" rx="2" fill="#FFFFFF" />
  </svg>
);

export const BotanicalWatermark: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M14 176C22 132 54 102 98 92C86 134 58 164 14 176Z"
      fill="#DCE9DC"
      fillOpacity="0.65"
    />
    <path
      d="M6 150C4 114 22 82 54 68C58 104 38 134 6 150Z"
      fill="#EAF1E7"
      fillOpacity="0.9"
    />
    <path
      d="M44 178C64 152 96 142 128 148C108 172 78 180 44 178Z"
      fill="#DCE9DC"
      fillOpacity="0.5"
    />
  </svg>
);
