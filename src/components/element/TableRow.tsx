import { RenderElementProps } from 'slate-react';

function TableRow({ attributes, children }: RenderElementProps) {
  return (
    <tr
      {...attributes}
    >
      {children}
    </tr>
  );
}

export default TableRow;