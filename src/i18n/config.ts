import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import { createContext } from 'react';

let editorI18n: typeof i18n | null = null;

export function initI18n() {
  editorI18n = i18n.createInstance();

  editorI18n
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
      cache: {
        enabled: true,
        prefix: `i18next_editor_`,
      },
    });
  return editorI18n;
}

export function getI18n() {
  return editorI18n;
}

export const EditorI18nContext = createContext<typeof i18n | null>(null);
