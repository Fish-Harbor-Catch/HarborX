import {
  LayoutDashboard,
  Gavel,
  Fish,
  Layers,
  ShieldCheck,
  Wallet,
  Users,
  BarChart3,
  Activity,
  Settings,
} from "lucide-react";

/**
 * Single source of truth for HarborX navigation metadata and role mapping.
 * Aligned with existing role permissions and page routes.
 */
export const NAV = {
  overview: ["Overview", LayoutDashboard],
  auctions: ["Auctions", Gavel],
  catches: ["My catches", Fish],
  bids: ["My bids", Layers],
  won: ["Won lots", ShieldCheck],
  payments: ["Payments", Wallet],
  users: ["User management", Users],
  reports: ["Reports", BarChart3],
  activity: ["Activity log", Activity],
  settings: ["Settings", Settings],
};

export const ROLES_LABEL = {
  admin: "Auction Manager",
  seller: "Seller",
  buyer: "Buyer",
};

// Backward-compatibility alias
export const rolesLabel = ROLES_LABEL;

/**
 * Primary navigation keys organized by user role.
 */
export const ROLE_NAV_ITEMS = {
  admin: ["overview", "auctions", "users", "payments", "reports"],
  seller: ["overview", "catches", "auctions", "payments"],
  buyer: ["overview", "auctions", "bids", "won", "payments"],
};

/**
 * Secondary workspace items common across all roles.
 */
export const SECONDARY_NAV_ITEMS = ["activity", "settings"];

/**
 * Curated high-frequency mobile bottom navigation tabs (max 4 primary + More).
 */
export const MOBILE_NAV_ITEMS = {
  admin: ["overview", "auctions", "users", "reports"],
  seller: ["overview", "catches", "auctions", "payments"],
  buyer: ["overview", "auctions", "bids", "won"],
};
