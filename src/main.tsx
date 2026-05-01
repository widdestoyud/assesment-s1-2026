import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import config from '@src/infrastructure/config';
import { webStorageAdapter } from '@src/infrastructure/storage/webStorageAdapter';
import './global.css';
import { routeTree } from './routeTree.gen';
import { initTranslation } from './translation/i18n.config.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Number.parseInt(config.tanStack.gcTime, 10) ?? 60000,
      staleTime: Number.parseInt(config.tanStack.staleTime, 10) ?? 10000,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key: string) => {
      const value = await webStorageAdapter.get<string>('tanstack', key);
      return value ?? null;
    },
    setItem: async (key: string, value: string) => {
      await webStorageAdapter.set('tanstack', key, value);
    },
    removeItem: async (key: string) => {
      await webStorageAdapter.delete('tanstack', key);
    },
  },
  key: 'MyTelkomselMBCStorage',
});

export const router = createRouter({
  routeTree,
  basepath: config.basePath || '/',
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    basePath: config.basePath,
  },
});

const i18n = initTranslation(queryClient);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, buster: config.basicVersion }}
    >
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </PersistQueryClientProvider>
  </StrictMode>
);
