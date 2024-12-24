import { Button, ButtonProps } from '@/components/ui/button';
import { InlineType } from '@/types';
import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { useCallback, useEffect, useState } from 'react';
import { isMarkActive } from '@/lib/editor';
import BoldIcon from '@/assets/bold.svg?react';
import ItalicIcon from '@/assets/italic.svg?react';
import UnderlineIcon from '@/assets/underline.svg?react';
import StrikethroughIcon from '@/assets/strikethrough.svg?react';

function BUIS() {
  const editor = useSlate();
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const getMarks = useCallback(() => {
    return editor.getMarks();
  }, [editor]);
  const [marks, setMarks] = useState(getMarks);

  useEffect(() => {
    const { onChange } = editor;

    editor.onChange = (...args) => {
      onChange(...args);
      setMarks(getMarks());
    };

    return () => {
      editor.onChange = onChange;
    };
  }, [editor, getMarks]);
  const handleClick = useCallback((format: InlineType) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive = isMarkActive(editor, format);

      if (isActive) {
        editor.removeMark(format);
      } else {
        editor.addMark(format, true);
      }

      setMarks(getMarks());
    };
  }, [editor, getMarks]);

  const getFormatButtonProps = useCallback((format: InlineType) => {
    return {
      color: (marks?.[format] ? 'primary' : 'secondary'),
      onClick: handleClick(format),
      size: 'icon',
      disabled: readOnly || !focused,
      variant: 'ghost',
    } as ButtonProps;
  }, [marks, handleClick, readOnly, focused]);
  return (
    <>
      <Button {...getFormatButtonProps(InlineType.Bold)}>
        <BoldIcon className={'!w-4 !h-4'}/>
      </Button>
      <Button {...getFormatButtonProps(InlineType.Italic)}>
        <ItalicIcon className={'!w-4 !h-4'}/>
      </Button>
      <Button {...getFormatButtonProps(InlineType.Underline)}>
        <UnderlineIcon className={'!w-4 !h-4'}/>
      </Button>
      <Button {...getFormatButtonProps(InlineType.Strikethrough)}>
        <StrikethroughIcon className={'!w-4 !h-4'}/>
      </Button>
    </>
  );
}

export default BUIS;