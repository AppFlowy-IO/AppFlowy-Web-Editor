import { useCallback, useContext, useEffect, useMemo } from 'react';
import { EditorProps } from '@/types';
import '@/styles/index.scss';
import { initI18n } from '@/i18n/config';
import { addResourceBundle, changeLanguage } from '@/i18n';
import RichText from './RichText';
import { Descendant, Operation } from 'slate';
import { transformFromSlateData, transformToSlateData } from '@/lib/transform';
import { EditorContext } from '@/editor/context';

initI18n();

export function Editor({
  locale,
  theme = 'light',
  readOnly = false,
  onChange,
  initialValue: initialValueProp,
  modalZIndex,
}: EditorProps) {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('EditorProvider must be used');
  }

  useEffect(() => {
    void (async () => {
      if (locale) {
        const resources = locale.resources || (await import(`../locales/${locale.lang}.json`)).default;
        addResourceBundle(locale.lang, 'editor', resources.editor);
        await changeLanguage(locale.lang);
      }
    })();
  }, [locale]);

  useEffect(() => {
    document.documentElement.setAttribute('data-editor-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (modalZIndex) {
      document.documentElement.style.setProperty('--z-modal', `${modalZIndex}`);
    }
  }, [modalZIndex]);

  const handleChange = useCallback((ops: Operation[], value: Descendant[]) => {
    const isSelectionChange = ops.every(op => op.type === 'set_selection');
    if (isSelectionChange) return;
    // convert value to EditorData
    const data = transformFromSlateData(value);
    onChange?.(data);
  }, [onChange]);

  const value = useMemo(() => {
    // convert initialValue to Descendant[]
    if (!initialValueProp) return undefined;
    return transformToSlateData(initialValueProp);
  }, [initialValueProp]);

  return (
    <div
      className="appflowy-editor flex flex-col selection:bg-selection w-full text-foreground overflow-hidden">
      <RichText editor={context.editor} onChange={handleChange} initialValue={value} readOnly={readOnly}/>
    </div>
  );
}

export default Editor;