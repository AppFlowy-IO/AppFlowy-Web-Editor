import { decorateCode } from './utils';
import { useMemo } from 'react';
import { BaseRange, Editor, NodeEntry, Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { NodeType as BlockType } from '@/types';

export function useDecorate(editor: ReactEditor) {

  return useMemo(() => {
    return (entry: NodeEntry): BaseRange[] => {
      if (!entry) return [];
      const path = entry[1];

      const blockEntry = editor.above({
        at: path,
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === BlockType.Code,
      });

      if (!blockEntry) return [];

      const block = blockEntry[0] as Element;

      if (block.type === BlockType.Code) {
        return decorateCode(entry, (block.data?.language as string) || 'plaintext');
      }

      return [];
    };
  }, [editor]);
}
