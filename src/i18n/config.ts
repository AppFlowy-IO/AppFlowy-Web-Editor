import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import resourcesToBackend from 'i18next-resources-to-backend';

let editorI18n: typeof i18n | null = null;

export function initI18n() {
  editorI18n = i18n.createInstance();

  editorI18n
    .use(resourcesToBackend((language: string) => {
      return import(`../locales/${language}.json`);
    }))
    .use(initReactI18next)
    .init({
      resources: { en: { editor: en.editor } },
      lng: 'en',
      fallbackLng: 'en',
      defaultNS: 'editor',
      interpolation: {
        escapeValue: false,
      },
      keySeparator: '.',
    });
}

export function getI18n() {
  return editorI18n;
}