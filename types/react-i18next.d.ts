import 'react-i18next';
import en from '../src/translation/locale/en.ts';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en;
    };
  }
}
