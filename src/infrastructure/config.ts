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
  api: {
    url: process.env.VITE_API_URL ?? import.meta.env.VITE_API_URL,
    timeout: process.env.VITE_API_TIMEOUT ?? import.meta.env.VITE_API_TIMEOUT,
    wcmsUrl: process.env.VITE_WCMS_HOST ?? import.meta.env.VITE_WCMS_HOST,
  },
  encrypt: {
    algo:
      process.env.VITE_API_CIPHERALGORITHM ??
      import.meta.env.VITE_API_CIPHERALGORITHM,
    key: process.env.VITE_API_KEY ?? import.meta.env.VITE_API_KEY,
    hashKey: process.env.VITE_API_HASH_KEY ?? import.meta.env.VITE_API_HASH_KEY,
  },
  tanStack: {
    gcTime: process.env.VITE_GC_TIME ?? import.meta.env.VITE_GC_TIME,
    staleTime: process.env.VITE_STALE_TIME ?? import.meta.env.VITE_STALE_TIME,
    queryDevTool:
      process.env.VITE_QUERY_DEVTOOL ?? import.meta.env.VITE_QUERY_DEVTOOL,
    routeDevTool:
      process.env.VITE_ROUTE_DEVTOOL ?? import.meta.env.VITE_ROUTE_DEVTOOL,
  },
  signature: {
    clientId:
      process.env.VITE_PS_CLIENT_ID ?? import.meta.env.VITE_PS_CLIENT_ID,
  },
  gtm: {
    enable: process.env.VITE_GTM_ENABLE ?? import.meta.env.VITE_GTM_ENABLE,
    id: process.env.VITE_GTM_ID ?? import.meta.env.VITE_GTM_ID,
  },
};
