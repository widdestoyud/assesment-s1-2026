import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import LandingPage from '@home/LandingPage';

export const Route = createFileRoute('/_pathlessLayout/landing-page')({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        name: t(
          'web_register_landing_document_title',
          'Welcome to MyTelkomsel'
        ),
        content: 'MyTelkomsel Prepaid Registration',
      },
      {
        title: t(
          'web_register_landing_document_title',
          'Welcome to MyTelkomsel'
        ),
      },
    ],
  }),
});
