import { useMemo, useContext, useCallback } from 'react';
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
  const applyData = useCallback((data: EditorData) => {
    editor.children = transformToSlateData(data);
    Editor.normalize(editor, { force: true });
  }, [editor]);

  const applyMarkdown = useCallback((markdown: string) => {
    editor.children = markdownToSlateData(markdown);
    console.log(editor.children);
    Editor.normalize(editor, { force: true });
  }, [editor]);

  const appflowyEditor = useMemo(() => {
    return {
      applyData,
      applyMarkdown,
    };
  }, [applyData, applyMarkdown]);

  return <EditorContext.Provider value={{ editor, appflowyEditor }}>{children}</EditorContext.Provider>;
};