import Text from '@/assets/paragraph.svg?react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { useCallback } from 'react';
import { isBlockActive, turnToType } from '@/lib/editor';
import { NodeType } from '@/types';

function Aa() {
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const editor = useSlate();

  const getButtonProps = useCallback((type: NodeType) => {
    const isActive = isBlockActive(editor, type);
    return {
      color: isActive ? 'primary' : 'secondary',
      onClick: () => {
        turnToType(editor, type);
      },
      size: 'icon',
      disabled: readOnly || !focused,
      variant: 'ghost',
      className: 'justify-start',
    } as ButtonProps;
  }, [editor, readOnly, focused]);

  return (
    <Button {...getButtonProps(NodeType.Paragraph)}>
      <Text className={'!w-5 !h-5'}/>
    </Button>
  );
}

export default Aa;