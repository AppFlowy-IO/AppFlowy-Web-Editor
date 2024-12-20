import { useMemo, useContext, useCallback, useState } from 'react';
import { withCustomEditor } from '@/plugins';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditor, Editor } from 'slate';
import { AppFlowyEditor, EditorData } from '@/types';
import { transformToSlateData } from '@/lib/transform';
import { EditorContext } from '@/editor/context';
import { markdownToSlateData } from '@/lib/mdast';

export function useEditor(): AppFlowyEditor {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within a EditorProvider');
  }

  return context.appflowyEditor;
}

export const EditorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const editor = useMemo(() => withCustomEditor(withHistory(withReact(createEditor()))), []);
  const [, setClock] = useState(0);

  const applyData = useCallback((data: EditorData) => {
    editor.children = transformToSlateData(data);
    Editor.normalize(editor, { force: true });
    setClock(prev => prev + 1);
  }, [editor]);

  const applyMarkdown = useCallback((markdown: string) => {
    editor.children = markdownToSlateData(markdown);
    Editor.normalize(editor, { force: true });
    setClock(prev => prev + 1);
  }, [editor]);

  const appflowyEditor = useMemo(() => {
    return {
      applyData,
      applyMarkdown,
    };
  }, [applyData, applyMarkdown]);

  const renderChildren = useCallback(() => {
    return children;
  }, [children]);

  return <EditorContext.Provider value={{ editor, appflowyEditor }}>{renderChildren()}</EditorContext.Provider>;
};