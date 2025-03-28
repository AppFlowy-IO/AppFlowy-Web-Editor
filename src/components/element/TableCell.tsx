import { RenderElementProps } from 'slate-react';

function TableCell({ attributes, children, element }: RenderElementProps) {

  return (
    <td
      {...attributes}
      rowSpan={1}
      colSpan={1}
      data-block-type={element.type}
      style={{
         width: '250px',
         minWidth: '250px',
      }}
    >
      <div
        className={'flex flex-col gap-1'}
      >
        {children}
      </div>
    </td>
  );
}

export default TableCell;