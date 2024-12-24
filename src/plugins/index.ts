import { ReactEditor } from 'slate-react';
import { Editor, Element, Range, Point, NodeEntry, Path } from 'slate';
import { NodeType } from '@/types';
import { withMarkdown } from '@/plugins/withMarkdown';
import { turnToType } from '@/lib/editor';

export const withCustomEditor = (editor: ReactEditor) => {
  const { insertBreak, deleteBackward, splitNodes } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;
    if (!selection) return;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type !== NodeType.Paragraph && n.type !== NodeType.NestedBlock,
      });

      if (match) {
        const [node, path] = match as NodeEntry<Element>;
        const string = Editor.string(editor, path);
        if (string.length === 0) {
          const start = Editor.start(editor, path);

          if (Point.equals(selection.anchor, start)) {
            turnToType(editor, NodeType.Paragraph);
            return;
          }
        }
        if (node.type === NodeType.Heading) {
          insertBreak();
          turnToType(editor, NodeType.Paragraph);
          return;
        } else if (node.type === NodeType.Todo && node.data?.checked) {
          insertBreak();
          editor.setNodes({
            type: NodeType.Todo,
            data: {
              checked: false,
            },
          }, {
            at: Path.next(path),
          });
          return;
        }

      }
    }

    const [, path] = editor.node(selection);
    const blockPath = path.slice(0, -1);

    const shouldLiftBlock = blockPath.length > 1 && blockPath[blockPath.length - 1] === 0;

    insertBreak();

    if (shouldLiftBlock) {
      editor.liftNodes({
        at: blockPath,
      });
    }
  };

  editor.splitNodes = (options) => {

    const {
      always,
      voids,
    } = options || {};
    splitNodes(options);

    if (always && !voids) {
      const marks = Editor.marks(editor);
      Object.keys(marks || {}).forEach(mark => {
        editor.removeMark(mark);
      });
    }

  };
  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type !== NodeType.Paragraph && n.type !== NodeType.NestedBlock,
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);

        if (Point.equals(selection.anchor, start)) {
          turnToType(editor, NodeType.Paragraph);
          return;
        }
      }
    }

    deleteBackward(...args);
  };
  return withMarkdown(editor);
};