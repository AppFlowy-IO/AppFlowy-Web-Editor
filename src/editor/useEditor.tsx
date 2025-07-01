import { useMemo, useContext, useCallback } from "react";
import { withCustomEditor } from "@/plugins";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import { createEditor, Descendant, Editor, Element } from "slate";
import { AppFlowyEditor, EditorData } from "@/types";
import { transformFromSlateData, transformToSlateData } from "@/lib/transform";
import { EditorContext } from "@/editor/context";
import { parseMarkdown } from "@/lib/mdast";

export function useEditor(): AppFlowyEditor {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within a EditorProvider");
  }

  return context.appflowyEditor;
}

export const EditorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const editor = useMemo(
    () => withCustomEditor(withHistory(withReact(createEditor()))),
    []
  );

  const replaceContent = useCallback(
    (newContent: Descendant[]) => {
      if (newContent.length === 0) {
        newContent.push({
          type: "paragraph",
          children: [{ text: "" }],
        });
      }

      editor.children = newContent;

      try {
        editor.select(editor.start([0]));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        // Do nothing
      }

      Editor.normalize(editor, { force: true });
    },
    [editor]
  );

  const applyData = useCallback(
    (data: EditorData) => {
      replaceContent(transformToSlateData(data));
    },
    [replaceContent]
  );

  const applyMarkdown = useCallback(
    (markdown: string) => {
      const newContent = parseMarkdown(markdown);

      replaceContent(transformToSlateData(newContent));
    },
    [replaceContent]
  );

  const getData = useCallback(() => {
    const slateData = editor.children;
    return transformFromSlateData(slateData);
  }, [editor]);

  const appflowyEditor = useMemo(() => {
    return {
      applyData,
      applyMarkdown,
      getData,
    };
  }, [getData, applyData, applyMarkdown]);

  return (
    <EditorContext.Provider value={{ editor, appflowyEditor }}>
      {children}
    </EditorContext.Provider>
  );
};
