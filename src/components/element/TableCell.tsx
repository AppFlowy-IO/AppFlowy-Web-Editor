import { RenderElementProps } from 'slate-react';

function TableCell({ attributes, children }: RenderElementProps) {
  return (
    <td
      {...attributes}
      rowSpan={1}
      colSpan={1}
      data-block-type="table-cell"
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