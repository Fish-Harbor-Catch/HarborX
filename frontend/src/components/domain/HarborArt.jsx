import React from "react";

/**
 * Coastal Harbor Landscape Artwork SVG.
 */
export function HarborArt() {
  return (
    <svg viewBox="0 0 480 190" className="harbor-art" aria-hidden="true">
      <circle cx="352" cy="61" r="38" fill="#7dd8d1" opacity=".26" />
      <path
        d="M0 161Q60 142 120 160T240 160T360 160T480 160V190H0Z"
        fill="#3ca7ac"
        opacity=".22"
      />
      <path
        d="M0 177Q60 158 120 176T240 176T360 176T480 176"
        fill="none"
        stroke="#74d4cf"
        opacity=".45"
      />
      <g transform="translate(130 30)">
        <path d="m22 101 29 38h162l32-38Z" fill="#d6efed" />
        <path d="M33 105h199l-9 12H42Z" fill="#23a3a6" />
        <path d="M84 100V62h88v38" fill="#fff" />
        <path d="M95 73h20v15H95Zm31 0h20v15h-20Z" fill="#458697" />
        <path
          d="M87 61V49h91l10 14"
          stroke="#cde7e8"
          strokeWidth="7"
          fill="none"
        />
        <path
          d="M153 48V9m-24 12h50M190 101V33l28 6"
          stroke="#b5d9dd"
          strokeWidth="3"
          fill="none"
        />
        <path d="m155 11 26 11-26 10" fill="#24b8ae" />
        <circle
          cx="77"
          cy="119"
          r="10"
          fill="none"
          stroke="#0d3558"
          strokeWidth="4"
        />
        <circle
          cx="197"
          cy="119"
          r="10"
          fill="none"
          stroke="#0d3558"
          strokeWidth="4"
        />
      </g>
      <path
        d="M390 141V55h13v86m-16-87h19l-9-13Zm-5 91h33"
        fill="#9bc8cc"
        opacity=".45"
      />
      <path
        d="m27 44 12-5 12 5m18-15 10-4 10 4"
        fill="none"
        stroke="#b0dddd"
        strokeWidth="2"
      />
    </svg>
  );
}
