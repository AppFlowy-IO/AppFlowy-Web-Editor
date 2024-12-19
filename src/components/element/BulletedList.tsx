import DiscIcon from '@/assets/bulleted_list_icon_1.svg?react';
import CircleIcon from '@/assets/bulleted_list_icon_2.svg?react';
import SquareIcon from '@/assets/bulleted_list_icon_3.svg?react';
import { ReactEditor, RenderElementProps, useReadOnly, useSlate } from 'slate-react';
import { useMemo } from 'react';
import { getListLevel } from '@/lib/list';
import { NodeType } from '@/types';

enum Letter {
  Disc,
  Circle,
  Square,
}

function BulletedList({ attributes, children, element }: RenderElementProps) {
  const editor = useSlate();
  const path = ReactEditor.findPath(editor, element);

  const letter = useMemo(() => {
    const level = getListLevel(editor, element.type as NodeType, path);

    if (level % 3 === 0) {
      return Letter.Disc;
    } else if (level % 3 === 1) {
      return Letter.Circle;
    } else {
      return Letter.Square;
    }
  }, [element.type, editor, path]);

  const Icon = useMemo(() => {
    switch (letter) {
      case Letter.Disc:
        return DiscIcon;
      case Letter.Circle:
        return CircleIcon;
      case Letter.Square:
        return SquareIcon;
    }
  }, [letter]);
  const readOnly = useReadOnly();
  return (
    <div {...attributes} className={'flex gap-1'} data-block-type={element.type}>
      <span
        data-playwright-selected={false}
        contentEditable={false}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        className={'min-w-5 h-6'}
      >
      <Icon className={'w-5 h-6'}/>
    </span>

      <span className={'flex-1'} suppressContentEditableWarning contentEditable={!readOnly}>
        {children}
      </span>
    </div>
  );
}

export default BulletedList;