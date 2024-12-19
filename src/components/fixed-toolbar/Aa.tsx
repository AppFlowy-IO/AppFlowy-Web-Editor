import Text from '@/assets/paragraph.svg?react';
import { Button, ButtonProps } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { useCallback, useState } from 'react';
import { useTranslation } from '@/i18n';
import { getBlock, isBlockActive, turnToType } from '@/lib/editor';
import H1 from '@/assets/h1.svg?react';
import H2 from '@/assets/h2.svg?react';
import H3 from '@/assets/h3.svg?react';
import Quote from '@/assets/quote.svg?react';

import Paragraph from '@/assets/aa_text.svg?react';
import { NodeType } from '@/types';

function Aa() {
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const editor = useSlate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleHeadingClick = useCallback((level: number) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      turnToType(editor, NodeType.Heading, { level });
      setOpen(false);
    };
  }, [editor]);

  const getHeadingButtonProps = useCallback((level: number) => {
    const entry = getBlock(editor);
    const activeHeadingLevel = entry ? entry[0].data?.level : -1;

    return {
      color: (activeHeadingLevel === level ? 'primary' : 'secondary'),
      onClick: handleHeadingClick(level),
      size: 'default',
      disabled: readOnly || !focused,
      variant: 'ghost',
      className: 'justify-start',
    } as ButtonProps;
  }, [editor, handleHeadingClick, readOnly, focused]);

  const getButtonProps = useCallback((type: NodeType) => {
    const isActive = isBlockActive(editor, type);
    return {
      color: isActive ? 'primary' : 'secondary',
      onClick: () => {
        turnToType(editor, type);
        setOpen(false);
      },
      size: 'default',
      disabled: readOnly || !focused,
      variant: 'ghost',
      className: 'justify-start',
    } as ButtonProps;
  }, [editor, readOnly, focused]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={'ghost'} size={'icon'} onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
        }} onMouseUp={e => {
          e.stopPropagation();
        }} disabled={readOnly || !focused} color={'secondary'}>
          <Text className={'!w-5 !h-5'}/>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={'center'}
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className={'flex flex-col gap-2'}>
          <Button {...getHeadingButtonProps(1)} startIcon={<H1 className={'!w-5 !h-5'}/>}>
            {t('heading', {
              level: 1,
            })}
          </Button>
          <Button startIcon={<H2 className={'!w-5 !h-5'}/>} {...getHeadingButtonProps(2)}>
            {t('heading', {
              level: 2,
            })}
          </Button>
          <Button startIcon={<H3 className={'!w-5 !h-5'}/>} {...getHeadingButtonProps(3)}>
            {t('heading', {
              level: 3,
            })}
          </Button>
          <Button startIcon={<Paragraph className={'!w-5 !h-5'}/>} {...getButtonProps(NodeType.Paragraph)}>
            {t('paragraph')}
          </Button>
          <Button startIcon={<Quote className={'w-5 h-5'}/>} {...getButtonProps(NodeType.Quote)}>
            {t('blockquote')}
          </Button>
        </div>

      </PopoverContent>
    </Popover>
  );
}

export default Aa;