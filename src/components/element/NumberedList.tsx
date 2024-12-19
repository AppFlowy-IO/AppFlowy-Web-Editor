import { ReactEditor, RenderElementProps, useReadOnly, useSlate } from 'slate-react';
import { useMemo } from 'react';
import { NodeType } from '@/types';
import { getListLevel, letterize, romanize } from '@/lib/list';
import { Element, NodeEntry, Path } from 'slate';

enum Letter {
  Number = 'number',
  Letter = 'letter',
  Roman = 'roman',
}

function getLetterNumber(index: number, letter: Letter) {
  if (letter === Letter.Number) {
    return index;
  } else if (letter === Letter.Letter) {
    return letterize(index);
  } else {
    return romanize(index);
  }
}

function NumberedList({ attributes, children, element }: RenderElementProps) {
  const editor = useSlate();

  const path = ReactEditor.findPath(editor, element);

  const index = useMemo(() => {
    let index = 1;

    let topNode;

    if (path.length === 1 && path[0] === 0) {
      return index;
    }

    try {
      const [parent, parentPath] = editor.parent(path) as NodeEntry<Element>;
      let prevPath;
      if (parent.type === NodeType.NestedBlock && path[path.length - 1] === 0) {
        prevPath = Path.previous(parentPath);
      } else {
        prevPath = Path.previous(path);
      }

      while (prevPath) {
        const prev = editor.node(prevPath);

        const prevNode = prev[0] as Element;

        if (prevNode.type === element.type) {
          index += 1;
          topNode = prevNode;
        } else if (prevNode.type === NodeType.NestedBlock) {
          const firstChild = prevNode.children[0] as Element;
          if (firstChild.type === element.type) {
            index += 1;
            topNode = firstChild;
          }
        } else {
          break;
        }

        if (prevPath.length === 1 && prevPath[0] === 0) {
          return index;
        }

        prevPath = Path.previous(prevPath);
      }
    } catch (e) {
      console.error(e);
      console.log('editor', editor.children);
    }

    if (!topNode) {
      return Number(element.data?.number ?? 1);
    }

    const startIndex = topNode.data?.number ?? 1;

    return index + Number(startIndex) - 1;
  }, [editor, element, path]);

  const letter = useMemo(() => {
    const level = getListLevel(editor, element.type as NodeType, path);

    if (level % 3 === 0) {
      return Letter.Number;
    } else if (level % 3 === 1) {
      return Letter.Letter;
    } else {
      return Letter.Roman;
    }
  }, [element.type, editor, path]);

  const dataNumber = useMemo(() => {
    return getLetterNumber(index, letter);
  }, [index, letter]);
  const readOnly = useReadOnly();
  return (
    <div {...attributes} className={'flex gap-1'} data-block-type={element.type}>
      <span onMouseDown={(e) => {
        e.preventDefault();
      }} className={'min-w-5 h-6 flex justify-center'} contentEditable={false} data-number={dataNumber}/>
      <span className={'flex-1'} suppressContentEditableWarning contentEditable={!readOnly}>
        {children}
      </span>
    </div>
  );
}

export default NumberedList;