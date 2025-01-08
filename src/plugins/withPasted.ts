import { ReactEditor } from 'slate-react';
import { Node, Text } from 'slate';
export const withPasted = (editor: ReactEditor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const fragment = data.getData('application/x-appflowy-fragment');

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsed = JSON.parse(decoded) as AppFlowyFragment[];

      const newFragment = convertSlateFragmentTo(parsed);
      editor.insertFragment(newFragment);
      return;
    }

    insertData(data);
  }

  return editor;
};

interface AppFlowyFragment {
  type: string;
  data: {
    [key: string]: string;
  };
  children: [
    {
      type: 'text',
      children: Text[]
    },
    ...AppFlowyFragment[]
  ];
}

export function convertSlateFragmentTo(parsed: AppFlowyFragment[]) {
  const nodes: Node[] = [];
  const flatten = (node: AppFlowyFragment) => {
    const [textNode, ...children] = node.children;
    if (textNode.type !== 'text') {
      return;
    }
    nodes.push({
      type: node.type,
      children: textNode.children,
      data: node.data,
    });
    children?.forEach(flatten);
  }

  parsed.forEach(flatten);

  return nodes;
}