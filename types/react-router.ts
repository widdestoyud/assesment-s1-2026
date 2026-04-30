import { router } from '@src/main';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
