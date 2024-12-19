import { useTranslation as useReactI18next } from 'react-i18next';
import { getI18n } from '@/i18n/config';

export function changeLanguage(lang: string) {
  const editorI18n = getI18n();
  if (!editorI18n) throw new Error('i18n not initialized');
  return editorI18n.changeLanguage(lang);
}

export function addResourceBundle(lang: string, ns: string, resources: Record<string, string>) {
  const editorI18n = getI18n();
  if (!editorI18n) throw new Error('i18n not initialized');
  const isExist = editorI18n.hasResourceBundle(lang, ns);
  if (isExist) return;
  editorI18n.addResourceBundle(lang, ns, resources, true, true);
}

export const useTranslation: typeof useReactI18next = (_, options) => {
  const editorI18n = getI18n();
  if (!editorI18n) throw new Error('i18n not initialized');
  return useReactI18next('editor', { ...options, i18n: editorI18n });
};