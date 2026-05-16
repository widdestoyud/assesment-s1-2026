import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import config from '@src/infrastructure/config';
import './global.css';
import { routeTree } from './routeTree.gen';
import { initTranslation } from './translation/i18n.config.ts';

export const router = createRouter({
  routeTree,
  basepath: config.basePath || '/',
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    basePath: config.basePath,
  },
});

const i18n = initTranslation();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>
);
