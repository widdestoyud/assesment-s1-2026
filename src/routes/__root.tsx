import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { z } from 'zod';
import GlobalContextProvider from '@src/contexts/global.provider';
import config from '@src/infrastructure/config';
import LoadingMask from '@src/presentation/pages/LoadingMask';
import PopupError from '@src/presentation/pages/PopupError';

const globalSearchSchema = z.object({
  isMobile: z.boolean().optional(),
  token: z.string().optional(),
});

export const Route = createRootRouteWithContext<{
  basePath: string;
}>()({
  validateSearch: globalSearchSchema,
  head: () => ({
    meta: [
      {
        name: 'Welcome to MyTelkomsel Prepaid Registration',
        content: 'MyTelkomsel Prepaid Registration',
      },
      {
        title: 'MyTelkomsel Prepaid Registration',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }),
  component: () => {
    const activeQueryDevTool = config.tanStack.queryDevTool;
    const activeRouteDevTool = config.tanStack.routeDevTool;
    return (
      <GlobalContextProvider>
        <HeadContent />
        <Outlet />
        <>
          {activeQueryDevTool && (
            <ReactQueryDevtools buttonPosition="bottom-left" />
          )}
          {activeRouteDevTool && (
            <TanStackRouterDevtools position="bottom-right" />
          )}
        </>
        <LoadingMask />
        <PopupError />
      </GlobalContextProvider>
    );
  },
});
