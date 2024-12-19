import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'themeLabel': 'Theme',
          'languageLabel': 'Language',
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    keySeparator: '.',
    cache: {
      enabled: true,
      prefix: `i18next_translation_`,
    },
  });
