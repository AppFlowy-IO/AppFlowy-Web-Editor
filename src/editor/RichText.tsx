import { NodeType } from '@/types';
import { FC, useCallback } from 'react';
import { Editable, Slate, ReactEditor } from 'slate-react';
import {
  Descendant, NodeEntry, Operation,Element as SlateElement
} from 'slate';
import Element from '../components/element/Element';
import Leaf from '@/components/Leaf';
import { useKeydown } from '@/editor/useKeydown';
import { useDecorate } from '@/components/element/CodeBlock/useDecorate';
import { useTranslation } from '@/i18n';

const defaultInitialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export interface RichTextProps {
  readOnly?: boolean;
  onChange?: (ops: Operation[], value: Descendant[]) => void;
  initialValue?: Descendant[];
  editor: ReactEditor;
  ToolbarComponent?: FC;
}

const RichText = ({
  editor,
  readOnly,
  onChange,
  ToolbarComponent,
  initialValue = defaultInitialValue,
}: RichTextProps) => {

  const handleOnChange = useCallback((value: Descendant[]) => {
    onChange?.(editor.operations, value);
  }, [editor, onChange]);

  const handleKeyDown = useKeydown(editor);
  const { t } = useTranslation();

  const codeDecorate = useDecorate(editor);
  return (
    <Slate editor={editor} onChange={handleOnChange} initialValue={initialValue}>
      {ToolbarComponent && <ToolbarComponent/>}
      <Editable
        placeholder={editor.children.length > 0 && (editor.children[0] as SlateElement).type !== NodeType.Paragraph ? undefined : t('placeholder')}
        readOnly={readOnly}
        className={'outline-none flex-1 h-auto px-5'}
        renderElement={Element}
        renderLeaf={Leaf}
        onKeyDown={handleKeyDown}
        renderPlaceholder={({ children, attributes }) => (
          <div {...attributes}>
            <p>{children}</p>
          </div>
        )}
        decorate={(entry: NodeEntry) => {
          const codeDecoration = codeDecorate?.(entry);
          return codeDecoration;
        }}
        autoComplete={'off'}
        spellCheck={false}
      />
    </Slate>
  );
};

export default RichText;