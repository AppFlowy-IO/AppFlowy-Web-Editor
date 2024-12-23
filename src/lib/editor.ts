import { Editor, Element, Location, NodeEntry, Transforms } from 'slate';
import { CheckboxData, InlineType, NodeType } from '@/types';
import { ElementData } from '@/@types/editor';

export function isBlockActive(editor: Editor, blockType: NodeType) {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n.type as NodeType) === blockType,
    }),
  );

  return !!match;
}

export function getBlock(editor: Editor) {
  const { selection } = editor;
  if (!selection) return;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        Element.isElement(n),
    }),
  );

  return match as NodeEntry<Element>;
}

export function isMarkActive(editor: Editor, format: InlineType) {
  const marks = Editor.marks(editor);
  return marks ? !!marks[format] : false;
}

export function getMark(editor: Editor, format: InlineType) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] : null;
}

export function toggleTodoList(editor: Editor, at?: Location) {
  const { selection } = editor;
  const newAt = at || selection;
  if (!newAt) return;

  const [entry] = Editor.nodes(editor, {
    at: newAt,
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === NodeType.Todo,
  });

  if (!entry) return;

  const [node, path] = entry as NodeEntry<Element>;

  const oldData = node.data as CheckboxData || { checked: false };
  Editor.withoutNormalizing(editor, () => {
    Transforms.setNodes(editor, {
      data: {
        checked: !oldData.checked,
      },
    }, { at: path });
  });
}

export function turnToType(editor: Editor, type: NodeType, data?: ElementData) {
  const { selection } = editor;
  if (!selection) return;

  editor.withoutNormalizing(() => {
    Transforms.setNodes(editor, {
      type,
      data,
    }, { at: selection });
  });
}

export function toggleMark(editor: Editor, format: InlineType) {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    editor.removeMark(format);
  } else {
    editor.addMark(format, true);
  }
}

export function highLight(editor: Editor) {
  const isActive = isMarkActive(editor, InlineType.BgColor);

  if (isActive) {
    editor.removeMark(InlineType.BgColor);
  } else {
    editor.addMark(InlineType.BgColor, '#FFD700');
  }
}