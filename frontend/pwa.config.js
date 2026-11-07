export const pwaOptions = {
  registerType: "prompt",
  injectRegister: null,
  includeAssets: ["favicon.svg", "icons/*.png"],
  manifest: {
    id: "/",
    name: "HarborX — Fish Harbor Catch and Auction Management",
    short_name: "HarborX",
    description:
      "Record catches and manage harbor auctions. Seller drafts work offline after setup.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f8fa",
    theme_color: "#0d3558",
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    cacheId: "harborx-shell",
    globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
    navigateFallback: "index.html",
    navigateFallbackDenylist: [/^\/api(?:\/|$)/],
    cleanupOutdatedCaches: true,
    skipWaiting: false,
    clientsClaim: false,
    // No runtime caching: API requests (including all mutations) go to network.
    runtimeCaching: [],
  },
  devOptions: { enabled: false },
};
