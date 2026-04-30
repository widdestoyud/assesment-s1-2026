import { createFileRoute } from '@tanstack/react-router';
import AboutScreen from '@src/presentation/pages/About';

export const Route = createFileRoute('/_pathlessLayout/about')({
  component: AboutScreen,
  head: () => ({
    meta: [
      {
        name: 'About - MyTelkomsel Prepaid Registration',
        content: 'About MyTelkomsel Prepaid Registration',
      },
      {
        title: 'About - MyTelkomsel Prepaid Registration',
      },
    ],
  }),
});
