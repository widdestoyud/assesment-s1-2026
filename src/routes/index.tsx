import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import Splash from '@home/Splash';

export const Route = createFileRoute('/')({
  component: Splash,
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
