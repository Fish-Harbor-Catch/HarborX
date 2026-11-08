import React from "react";

/**
 * FishArt illustration component.
 */
export function FishArt({ type = "tuna", large = false }) {
  const shrimp = type === "prawns";
  return (
    <svg
      className={`fish-art ${large ? "large" : ""}`}
      viewBox="0 0 320 144"
      role="img"
      aria-label={shrimp ? "Prawns illustration" : "Fresh fish illustration"}
    >
      <defs>
        <linearGradient id={`sea-${type}`} x2="1" y2="1">
          <stop stopColor="#dcefed" />
          <stop offset="1" stopColor="#eff7f7" />
        </linearGradient>
        <linearGradient id={`fish-${type}`} x2="0.1" y2="1">
          <stop stopColor="#547e91" />
          <stop offset=".55" stopColor="#a7c0c9" />
          <stop offset="1" stopColor="#e8f0ef" />
        </linearGradient>
      </defs>
      <rect width="320" height="144" rx="14" fill={`url(#sea-${type})`} />
      <circle cx="257" cy="28" r="47" fill="#fff" opacity=".28" />
      <path
        d="M0 114 Q80 90 160 115T320 110"
        fill="none"
        stroke="#b9dcdb"
        strokeWidth="1"
      />
      <path
        d="M0 130 Q80 106 160 131T320 126"
        fill="none"
        stroke="#c5e2df"
        strokeWidth="1"
      />
      {shrimp ? (
        <g
          transform="translate(96 18)"
          fill="#d39880"
          stroke="#a96e58"
          strokeWidth="1.5"
        >
          <path d="M101 36C70 1 15 12 20 61s56 56 76 21C66 102 42 82 47 58s35-26 54-22Z" />
          <path
            d="m95 33 26-9-13 25-18-4M93 38q29-29 48-17M92 40q41-5 49 12M33 34l18 8m-26 8 23 6m-24 8 24 4m-19 9 25-2m-13 17 22-11m1 16 12-18m-32-6-7 22m21-16 5 24"
            fill="none"
          />
        </g>
      ) : (
        <g transform="translate(16 6) rotate(-8 145 65)">
          <path d="M93 66 39 30 48 70 32 105 91 83" fill="#63899b" />
          <path
            d="M80 75C121 19 226 22 272 70c-45 53-151 59-192 5Z"
            fill={`url(#fish-${type})`}
            stroke="#718f9c"
            strokeWidth="1"
          />
          <path d="m144 37 39-21 6 22m-45 67 35 17 6-18" fill="#67899a" />
          <path
            d="M216 42q-20 28 4 58"
            fill="none"
            stroke="#6c8d9a"
            strokeWidth="2"
          />
          <circle cx="245" cy="61" r="5" fill="#163e54" />
          <circle cx="247" cy="59" r="1.5" fill="white" />
          <path
            d="m266 79-15 1M132 77l35-9-12 22"
            stroke="#708f9c"
            fill="none"
          />
          <path
            d="m112 58 17 4m-4-12 16 4m-1 33 19 3m-38-18 14 3"
            stroke="#b9d1d4"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
}
