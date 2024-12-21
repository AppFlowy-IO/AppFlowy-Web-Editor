import Text from '@/assets/paragraph.svg?react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { useCallback, useMemo, useState } from 'react';
import { getBlock, turnToType } from '@/lib/editor';
import { NodeType } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BIUS from '@/components/fixed-toolbar/BIUS';
import { useTranslation } from '@/i18n';
import H1 from '@/assets/h1.svg?react';
import H2 from '@/assets/h2.svg?react';
import H3 from '@/assets/h3.svg?react';
import { ElementData } from '@/@types/editor';

function Aa() {
  const { t } = useTranslation();
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const editor = useSlate();
  const [open, setOpen] = useState(false);

  const entry = getBlock(editor);

  const getButtonProps = useCallback((type: NodeType, isActive: boolean, data?: ElementData) => {
    return {
      onClick: () => {
        if (isActive) {
          turnToType(editor, NodeType.Paragraph);
        } else {
          turnToType(editor, type, data);
        }
        setOpen(false);
      },
      disabled: readOnly || !focused,
      variant: 'ghost',
      className: 'justify-start',
    } as ButtonProps;
  }, [editor, readOnly, focused]);
  const type = entry?.[0].type;
  const data = entry?.[0].data;
  const options = useMemo(() => {

    return [
      {
        key: 'h1',
        type: NodeType.Heading,
        data: { level: 1 },
        label: t('heading', {
          level: 1,
        }),
        startIcon: H1,
        checked: type === NodeType.Heading && data?.level === 1,
      },
      {
        key: 'h2',
        data: { level: 2 },
        type: NodeType.Heading,
        label: t('heading', {
          level: 2,
        }),
        startIcon: H2,
        checked: type === NodeType.Heading && data?.level === 2,
      },
      {
        key: 'h3',
        data: { level: 3 },
        type: NodeType.Heading,
        label: t('heading', {
          level: 3,
        }),
        startIcon: H3,
        checked: type === NodeType.Heading && data?.level === 3,
      },
      {
        key: 'p',
        type: NodeType.Paragraph,
        label: t('paragraph'),
        startIcon: Text,
        checked: type === NodeType.Paragraph,
      },
    ];
  }, [data?.level, t, type]);

  const selectedOption = options.find(option => option.checked);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'ghost'}
          size={'icon'}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }} disabled={readOnly || !focused} color={'secondary'}>
          {selectedOption?.startIcon ? <selectedOption.startIcon className={'!w-5 !h-5 text-primary'}/> : <Text
            className={'!w-5 !h-5'}/>}
          <ChevronDown className="h-4 w-4"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={'center'}
        sideOffset={4}
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}>
        <div className={'flex flex-col w-full gap-2 p-2'}>
          <div className={'flex w-full justify-center items-center gap-1'}>
            <BIUS/>
          </div>
          <Separator/>
          <div className={'flex flex-col gap-1'}>
            {
              options.map(option => {
                return (
                  <Button
                    key={option.key}
                    {...getButtonProps(option.type, option.checked, option.data)}
                    startIcon={
                      <option.startIcon className={'!w-5 !h-5'}/>
                    }
                    endIcon={
                      option.checked ? <CheckIcon className={'!w-5 !h-5 ml-2 text-primary'}/> : null
                    }
                  >
                    {option.label}
                  </Button>
                );
              })
            }
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Aa;