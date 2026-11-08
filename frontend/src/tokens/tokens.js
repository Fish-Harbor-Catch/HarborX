/**
 * HarborX Design Tokens
 *
 * Single source of truth for design tokens used across the application.
 * Values reflect the coastal maritime theme: deep oceanic navies and harbor teals,
 * with clear high-contrast hierarchy, accessible interaction states, and resilient
 * responsive breakpoints.
 */

export const colors = {
  // Deep Oceanic Navies (Brand & Surface Identity)
  navy: {
    900: "#081f35",
    800: "#0a2c4b", // --navy-deep
    700: "#0d3558", // --navy (primary brand)
    600: "#19374d",
    500: "#20384c", // --ink
    400: "#445f72",
    300: "#7a8997", // --muted
    200: "#9ba8b1",
    100: "#dce5eb", // input & card borders
    50: "#f5f7f9", // --bg
  },

  // Harbor & Coastal Teals (Action & Interactive Identity)
  teal: {
    800: "#075a61",
    700: "#08727a", // --teal-dark
    600: "#10858c", // --teal (interactive primary)
    500: "#1ca6a7", // --teal-light
    400: "#42bdbb", // focus ring
    300: "#86d2cb",
    200: "#b5d7da",
    100: "#d9efec",
    50: "#e7f5f3", // --aqua
  },

  // Neutral & Surfaces
  canvas: "#f5f7f9",
  surface: "#ffffff",
  surfaceSubtle: "#f8fafb",
  surfaceMuted: "#eef2f5",
  surfaceInverse: "#0d3558",

  // Text Hierarchy
  text: {
    primary: "#20384c",
    secondary: "#476071",
    muted: "#7a8997",
    inverse: "#ffffff",
    inverseMuted: "#a1b9cc",
  },

  // Borders
  border: {
    default: "#e5ebef",
    subtle: "#edf1f4",
    strong: "#dce5eb",
    focus: "#10858c",
  },

  // Status & Feedback
  status: {
    success: {
      text: "#21976a",
      bg: "#e0f4eb",
      border: "#bfe5d6",
    },
    warning: {
      text: "#b48731",
      bg: "#fff2d9",
      border: "#f4e6bf",
    },
    danger: {
      text: "#c25f59",
      bg: "#fce9e8",
      border: "#f0cccc",
    },
    info: {
      text: "#427ca9",
      bg: "#e7f0f9",
      border: "#cddff0",
    },
  },
};

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: "10px", // Eyebrows, badges, micro metrics
    sm: "12px", // Labels, secondary buttons, alerts
    base: "13px", // Standard body text, inputs
    md: "14px", // Section subheadings
    lg: "15px", // Section headings (h2)
    xl: "16px", // Empty state headings, mobile touch input
    "2xl": "19px", // Modal titles, large avatars
    "3xl": "24px", // Offline workspace h1, large stats
    "4xl": "27px", // Page headings (h1)
    display: "clamp(32px, 3.4vw, 55px)", // Auth hero display
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.5",
    relaxed: "1.7",
    loose: "1.9",
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0",
    wide: "1.5px",
    eyebrow: "1.8px",
  },
};

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
};

export const radii = {
  none: "0px",
  xs: "4px", // Badges, tags, small counters
  sm: "7px", // Inputs, standard buttons, alerts
  md: "9px", // Stat cards, panels, list cards
  lg: "10px", // Toast notifications, main panels
  xl: "13px", // Modals, dialogs
  full: "9999px", // Avatars, pills, badges
};

export const shadows = {
  none: "none",
  sm: "0 1px 2px rgba(13, 53, 88, 0.05)",
  md: "0 4px 12px rgba(13, 53, 88, 0.08)",
  lg: "0 10px 30px rgba(13, 53, 88, 0.12)",
  toast: "0 10px 50px rgba(13, 53, 88, 0.16)",
  modal: "0 25px 100px rgba(0, 21, 43, 0.23)",
  focus: "0 0 0 3px rgba(16, 133, 140, 0.15)",
};

export const breakpoints = {
  sm: "480px", // Mobile phones
  md: "760px", // Tablet and mobile breakpoint
  lg: "1050px", // Compact desktop / landscape tablet
  xl: "1200px", // Standard desktop
  "2xl": "1500px", // Large screens / wide desktop
};

export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  dropdown: 10,
  sticky: 20,
  sidebar: 30,
  scrim: 40,
  modal: 50,
  toast: 100,
};

export const transitions = {
  fast: "0.15s ease",
  normal: "0.2s ease",
  slow: "0.3s ease",
};
