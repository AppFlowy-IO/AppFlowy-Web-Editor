import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getMark } from '@/lib/editor';
import { useFocused, useReadOnly, useSlate } from 'slate-react';
import { InlineType } from '@/types';
import ColorTheme from '@/assets/color_theme.svg?react';
import FontColorIcon from '@/assets/icon_fontcolor.svg?react';
import Line from '@/assets/line-1.svg?react';

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';

import { ColorEnum, renderColor } from '@/lib/color';
import { ChevronDown } from 'lucide-react';
import { Editor } from 'slate';

function Color() {
  const readOnly = useReadOnly();
  const focused = useFocused() && document.getSelection()?.type !== 'Node';
  const editor = useSlate();
  const activeBgColor = getMark(editor, InlineType.BgColor) as string;
  const activeFontColor = getMark(editor, InlineType.FontColor) as string;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const editorTextColors = useMemo(() => {
    return [{
      label: t('fontColorDefault'),
      color: '',
    }, {
      label: t('fontColorGray'),
      color: 'rgb(120, 119, 116)',
    }, {
      label: t('fontColorBrown'),
      color: 'rgb(159, 107, 83)',
    }, {
      label: t('fontColorOrange'),
      color: 'rgb(217, 115, 13)',
    }, {
      label: t('fontColorYellow'),
      color: 'rgb(203, 145, 47)',
    }, {
      label: t('fontColorGreen'),
      color: 'rgb(68, 131, 97)',
    }, {
      label: t('fontColorBlue'),
      color: 'rgb(51, 126, 169)',
    }, {
      label: t('fontColorPurple'),
      color: 'rgb(144, 101, 176)',
    }, {
      label: t('fontColorPink'),
      color: 'rgb(193, 76, 138)',
    }, {
      label: t('fontColorRed'),
      color: 'rgb(212, 76, 71)',
    }];
  }, [t]);

  const editorBgColors = useMemo(() => {
    return [{
      label: t('backgroundColorDefault'),
      color: '',
    }, {
      label: t('backgroundColorLime'),
      color: ColorEnum.Lime,
    }, {
      label: t('backgroundColorAqua'),
      color: ColorEnum.Aqua,
    }, {
      label: t('backgroundColorOrange'),
      color: ColorEnum.Orange,
    }, {
      label: t('backgroundColorYellow'),
      color: ColorEnum.Yellow,
    }, {
      label: t('backgroundColorGreen'),
      color: ColorEnum.Green,
    }, {
      label: t('backgroundColorBlue'),
      color: ColorEnum.Blue,
    }, {
      label: t('backgroundColorPurple'),
      color: ColorEnum.Purple,
    }, {
      label: t('backgroundColorPink'),
      color: ColorEnum.Pink,
    }, {
      label: t('backgroundColorRed'),
      color: ColorEnum.LightPink,
    }];
  }, [t]);

  const handlePickedColor = useCallback((format: InlineType, color: string) => {
    Editor.addMark(editor, format, color);
    setOpen(false);
  }, [editor]);
  const ref = React.useRef<HTMLButtonElement>(null);

  const popoverContent = useMemo(() => {
    return <div className={'p-3 flex flex-col gap-3 w-[200px]'}>
      <div className={'flex flex-col gap-2'}>
        <div className={'text-muted-foreground text-xs'}>{t('textColor')}</div>
        <div className={'flex flex-wrap gap-1.5'}>
          {editorTextColors.map((color, index) => {
            return <Tooltip
              key={index}
            >
              <TooltipContent>{color.label}</TooltipContent>
              <TooltipTrigger>
                <div
                  style={{
                    borderColor: activeFontColor === color.color ? 'hsl(var(--primary))' : undefined,
                  }}
                  className={`h-6 rounded-[6px] border hover:!border-primary border-secondary relative w-6 flex cursor-pointer items-center justify-center`}
                  onClick={() => handlePickedColor(InlineType.FontColor, color.color)}
                >
                  <FontColorIcon style={{
                    color: color.color || 'var(--foreground)',
                  }}/>
                </div>
              </TooltipTrigger>

            </Tooltip>;
          })}
        </div>
      </div>
      <div className={'flex flex-col gap-2'}>
        <div className={'text-muted-foreground text-xs'}>{t('backgroundColor')}</div>

        <div className={'flex flex-wrap gap-1.5'}>
          {editorBgColors.map((color, index) => {
            return <Tooltip
              key={index}
            >
              <TooltipContent>{color.label}</TooltipContent>
              <TooltipTrigger>
                <div
                  key={index}
                  style={{
                    backgroundColor: renderColor(color.color),
                    borderColor: activeBgColor === color.color ? 'hsl(var(--primary))' : undefined,
                  }}
                  className={'h-6 relative hover:!border-primary border border-secondary cursor-pointer w-6 overflow-hidden flex items-center rounded-[6px] justify-center'}
                  onClick={() => handlePickedColor(InlineType.BgColor, color.color)}
                >
                  {!color.color && <Line className={'w-full h-full'}/>}
                </div>

              </TooltipTrigger>

            </Tooltip>;
          })}
        </div>
      </div>
    </div>;
  }, [activeBgColor, activeFontColor, editorBgColors, editorTextColors, handlePickedColor, t]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={ref} style={{
          color: activeFontColor ? renderColor(activeFontColor) : undefined,
          backgroundColor: activeBgColor ? renderColor(activeBgColor) : undefined,
        }} variant={'ghost'} size={'icon'} onMouseDown={e => {
          e.preventDefault();
          e.stopPropagation();
        }} disabled={readOnly || !focused}>
          <ColorTheme className={'!w-4 !h-4'}/>
          <ChevronDown className="h-4 w-4"/>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={'center'}
        container={ref.current?.parentElement}
        sideOffset={4}
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}>
        <TooltipProvider>
          {popoverContent}
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
}

export default Color;