export default {
  dev: import.meta.env.DEV ?? false,
  basicVersion:
    process.env.VITE_BASIC_VERSION ?? import.meta.env.VITE_BASIC_VERSION,
  basePath: process.env.VITE_BASE_PATH ?? import.meta.env.VITE_BASE_PATH,
  /** When false, NFC capability check is bypassed (UI always shows as supported) */
  nfcCheckEnabled:
    (process.env.VITE_NFC_CHECK_ENABLED ?? import.meta.env.VITE_NFC_CHECK_ENABLED) === 'true',
  tanStack: {
    gcTime: process.env.VITE_GC_TIME ?? import.meta.env.VITE_GC_TIME,
    staleTime: process.env.VITE_STALE_TIME ?? import.meta.env.VITE_STALE_TIME,
    queryDevTool:
      process.env.VITE_QUERY_DEVTOOL ?? import.meta.env.VITE_QUERY_DEVTOOL,
    routeDevTool:
      process.env.VITE_ROUTE_DEVTOOL ?? import.meta.env.VITE_ROUTE_DEVTOOL,
  },
};
