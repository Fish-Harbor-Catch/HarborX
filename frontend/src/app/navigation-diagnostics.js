// Vite removes this branch from production. Never pass account or request data.
export function recordNavigation(event, details = {}) {
  if (import.meta.env.DEV)
    window.harborxNavigationDebug?.record(event, details);
}
