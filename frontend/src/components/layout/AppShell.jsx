import React, { useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { DemoRibbon } from "./DemoRibbon.jsx";
import { MobileNavigation } from "./MobileNavigation.jsx";
import PwaStatus from "../../PwaStatus.jsx";

/**
 * AppShell Layout Component
 *
 * Primary application shell composing:
 * - Responsive desktop sidebar & mobile drawer (Sidebar)
 * - Top navigation bar with breadcrumbs & connection state (Topbar)
 * - Simulation / demo mode indicator (DemoRibbon)
 * - Main view content container
 * - PWA installation & update status banner (PwaStatus)
 * - Persistent mobile bottom navigation (MobileNavigation)
 */
export function AppShell({
  children,
  user,
  role = "seller",
  page = "overview",
  pageTitle,
  onNavigate,
  isSidebarOpen = false,
  onOpenSidebar,
  onCloseSidebar,
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggleCollapse,
  liveCount = 0,
  hasUnverifiedBuyers = false,
  online = true,
  hasUnreadEvents = false,
  onLogout,
  onRulesClick,
  demo = false,
  rolesLabel,
  alerts,
  modals,
  showPwaStatus = true,
  pwaStatusComponent,
  className = "",
  ...props
}) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const isCollapsed =
    controlledCollapsed !== undefined
      ? controlledCollapsed
      : uncontrolledCollapsed;

  const handleToggleCollapse = () => {
    if (controlledToggleCollapse) {
      controlledToggleCollapse();
    } else {
      setUncontrolledCollapsed((prev) => !prev);
    }
  };

  return (
    <div
      className={`app-shell ${isCollapsed ? "sidebar-collapsed" : ""} ${className}`.trim()}
      {...props}
    >
      <Sidebar
        user={user}
        role={role}
        page={page}
        onNavigate={onNavigate}
        isOpen={isSidebarOpen}
        onClose={onCloseSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        liveCount={liveCount}
        hasUnverifiedBuyers={hasUnverifiedBuyers}
        onRulesClick={onRulesClick}
      />

      <div className="main-shell">
        <Topbar
          page={page}
          pageTitle={pageTitle}
          user={user}
          online={online}
          hasUnreadEvents={hasUnreadEvents}
          onOpenMenu={onOpenSidebar}
          onNavigate={onNavigate}
          onLogout={onLogout}
          isSidebarOpen={isSidebarOpen}
        />

        <main id="main-content">
          {demo && (
            <DemoRibbon
              role={role}
              roleLabel={rolesLabel?.[role]}
              onSwitchRole={onLogout}
            />
          )}
          {alerts}
          {children}
        </main>

        {modals}

        {showPwaStatus && (pwaStatusComponent || <PwaStatus />)}
      </div>

      <MobileNavigation
        role={role}
        page={page}
        onNavigate={onNavigate}
        onOpenMore={onOpenSidebar}
        liveCount={liveCount}
        hasUnverifiedBuyers={hasUnverifiedBuyers}
      />
    </div>
  );
}
