import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { getBlock, isBlockActive, turnToType } from '@/lib/editor';
import { useCallback } from 'react';
import { NodeType } from '@/types';
import { Button, ButtonProps } from '@/components/ui/button';
import Checkbox from '@/assets/checkbox.svg?react';

function List() {
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const editor = useSlate();
  const entry = getBlock(editor);
  const activeListType = entry ? entry[0].type : NodeType.Paragraph;

  const handleClick = useCallback((type: NodeType) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeListType === type) {
        turnToType(editor, NodeType.Paragraph);
      } else {
        turnToType(editor, type);
      }

    };
  }, [activeListType, editor]);

  const getButtonProps = useCallback((type: NodeType) => {
    const isActive = isBlockActive(editor, type);
    return {
      color: (isActive ? 'primary' : 'secondary'),
      onClick: handleClick(type),
      size: 'icon',
      variant: 'ghost',
      disabled: readOnly || !focused,
    } as ButtonProps;
  }, [editor, handleClick, readOnly, focused]);

  return (
    <>
      <Button {...getButtonProps(NodeType.Todo)}>
        <Checkbox className={'!w-5 !h-5'}/>
      </Button>
    </>
  );
}

export default List;