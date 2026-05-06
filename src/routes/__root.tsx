import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import config from '@src/infrastructure/config';
import BottomNavigation from '@components/BottomNavigation';

const globalSearchSchema = z.object({
  isMobile: z.boolean().optional(),
  token: z.string().optional(),
});

function RootLayout() {
  const activeQueryDevTool = config.tanStack.queryDevTool;
  const activeRouteDevTool = config.tanStack.routeDevTool;
  const { t } = useTranslation();

  return (
    <>
      <HeadContent />
      <div style={{ paddingBottom: '64px' }}>
        <Outlet />
      </div>
      <BottomNavigation t={t} />
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
}

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
  component: RootLayout,
});
