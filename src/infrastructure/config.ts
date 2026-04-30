export default {
  dev: import.meta.env.DEV ?? false,
  nodeEnv:
    process.env.VITE_NODE_ENV ||
    import.meta.env.NODE_ENV ||
    import.meta.env.VITE_NODE_ENV,
  basicVersion:
    process.env.VITE_BASIC_VERSION ?? import.meta.env.VITE_BASIC_VERSION,
  appVersion: process.env.VITE_APP_VERSION ?? import.meta.env.VITE_APP_VERSION,
  basePath: process.env.VITE_BASE_PATH ?? import.meta.env.VITE_BASE_PATH,
  tanStack: {
    gcTime: process.env.VITE_GC_TIME ?? import.meta.env.VITE_GC_TIME,
    staleTime: process.env.VITE_STALE_TIME ?? import.meta.env.VITE_STALE_TIME,
    queryDevTool:
      process.env.VITE_QUERY_DEVTOOL ?? import.meta.env.VITE_QUERY_DEVTOOL,
    routeDevTool:
      process.env.VITE_ROUTE_DEVTOOL ?? import.meta.env.VITE_ROUTE_DEVTOOL,
  },
};
