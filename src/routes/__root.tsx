import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { z } from 'zod';
import config from '@src/infrastructure/config';
import MainLayout from '@src/presentation/layouts/MainLayout';
import ErrorBoundary from '@components/ErrorBoundary';

const globalSearchSchema = z.object({
  isMobile: z.boolean().optional(),
  token: z.string().optional(),
});

function RootLayout() {
  const activeRouteDevTool = config.tanStack.routeDevTool === 'true';

  return (
    <>
      <HeadContent />
      <ErrorBoundary>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </ErrorBoundary>
      {activeRouteDevTool && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
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
