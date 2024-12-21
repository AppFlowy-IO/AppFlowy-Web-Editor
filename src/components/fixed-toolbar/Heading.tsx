import React, { useCallback, useState } from 'react';
import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { getBlock, turnToType } from '@/lib/editor';
import { NodeType } from '@/types';
import { Button } from '@/components/ui/button';
import H1 from '@/assets/h1.svg?react';
import H2 from '@/assets/h2.svg?react';
import H3 from '@/assets/h3.svg?react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

function Heading() {
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const editor = useSlate();
  const [open, setOpen] = useState(false);

  const entry = getBlock(editor);
  const activeHeadingLevel = entry ? entry[0].data?.level as number : -1;

  const isActive = activeHeadingLevel > 0 && activeHeadingLevel < 4;
  const handleHeadingClick = useCallback((level: number) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (entry && entry[0].type === NodeType.Heading && entry[0].data?.level === level) {
        turnToType(editor, NodeType.Paragraph);
      } else {
        turnToType(editor, NodeType.Heading, { level });
      }
      setOpen(false);
    };
  }, [editor, entry]);

  const getIcon = useCallback((level: number) => {
    switch (level) {
      case 1:
        return <H1 className={'!w-5 !h-5'}/>;
      case 2:
        return <H2 className={'!w-5 !h-5'}/>;
      case 3:
        return <H3 className={'!w-5 !h-5'}/>;
      default:
        return <H1 className={'!w-5 !h-5'}/>;
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'ghost'} size={'icon'} onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
        }} disabled={readOnly || !focused} color={
          isActive ? 'primary' : 'secondary'
        }>
          {getIcon(activeHeadingLevel)}
          <ChevronDown className="h-4 w-4"/>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={'center'}
        sideOffset={4}
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}>
        <div className={'flex gap-1'}>
          {
            [1, 2, 3].map(level => {
              return (
                <Button
                  key={level}
                  color={activeHeadingLevel === level ? 'primary' : 'secondary'}
                  onClick={handleHeadingClick(level)}
                  size={'icon'}
                  variant={'ghost'}
                  disabled={readOnly || !focused}
                >
                  {getIcon(level)}
                </Button>
              );
            })
          }

        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Heading;