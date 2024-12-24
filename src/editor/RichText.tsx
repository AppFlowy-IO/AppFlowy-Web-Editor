import { FC, useCallback } from 'react';
import { Editable, Slate, ReactEditor } from 'slate-react';
import {
  Descendant, NodeEntry, Operation,
} from 'slate';
import Element from '../components/element/Element';
import Leaf from '@/components/Leaf';
import { useKeydown } from '@/editor/useKeydown';
import { useTranslation } from '@/i18n';
import { useDecorate } from '@/components/element/CodeBlock/useDecorate';

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
  const { t } = useTranslation();

  const handleOnChange = useCallback((value: Descendant[]) => {
    onChange?.(editor.operations, value);
  }, [editor, onChange]);

  const handleKeyDown = useKeydown(editor);

  const codeDecorate = useDecorate(editor);
  return (
    <Slate editor={editor} onChange={handleOnChange} initialValue={initialValue}>
      {ToolbarComponent && <ToolbarComponent/>}
      <Editable
        readOnly={readOnly}
        className={'outline-none flex-1 h-auto px-5'}
        placeholder={t('placeholder')}
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