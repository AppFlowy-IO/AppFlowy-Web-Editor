import { RenderElementProps } from 'slate-react';

function TableRow({ attributes, children, element }: RenderElementProps) {
  return (
    <tr
      {...attributes}
      data-block-type={element.type}
    >
      {children}
    </tr>
  );
}

export default TableRow;