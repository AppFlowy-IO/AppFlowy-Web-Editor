import { ReactEditor, RenderElementProps, useReadOnly, useSlateStatic } from 'slate-react';
import { useCallback, useMemo } from 'react';
import { CheckboxData } from '@/types';
import { toggleTodoList } from '@/lib/editor';
import CheckboxUncheckSvg from '@/assets/uncheck.svg?react';
import CheckboxCheckSvg from '@/assets/check_filled.svg?react';

function Checkbox({ attributes, children, element }: RenderElementProps) {
  const editor = useSlateStatic();
  const data = useMemo(() => {
    return (element.data as CheckboxData) || {};
  }, [element.data]);
  const readOnly = useReadOnly();

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (readOnly) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    const path = ReactEditor.findPath(editor, element);
    editor.collapse({
      edge: 'end',
    });
    ReactEditor.focus(editor);
    toggleTodoList(editor, path);

  }, [editor, element, readOnly]);

  const iconClassName = useMemo(() => {
    const classList = [''];
    if (!readOnly) {
      classList.push('cursor-pointer');
    }
    return classList.join(' ');
  }, [readOnly]);

  return (
    <div {...attributes} className={'flex gap-1'} data-block-type={element.type}
         data-checked={data.checked}>
      <span
        onClick={handleClick}
        data-playwright-selected={false}
        contentEditable={false}
        className={iconClassName}
      >
        {data.checked ? <CheckboxCheckSvg className={'w-5 h-6'}/> : <CheckboxUncheckSvg
          className={'w-5 h-6'}/>}
      </span>
      <span className={'flex-1'} suppressContentEditableWarning contentEditable={!readOnly}>
        {children}
      </span>

    </div>
  );
}

export default Checkbox;