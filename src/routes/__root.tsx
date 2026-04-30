import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { z } from 'zod';
import config from '@src/infrastructure/config';

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
        name: 'Welcome to MyTelkomsel',
        content: 'MyTelkomsel Membership Benefit Card',
      },
      {
        title: 'MyTelkomsel Membership Benefit Card',
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
      <>
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
      </>
    );
  },
});
