import { useMemo } from 'react';
import { RenderElementProps } from 'slate-react';

function Table({ attributes, children, element }: RenderElementProps) {
  const {
    children: rows,
  } = element;

  const columnCount = useMemo(() => {
    const firstRow = rows[0];

    if (!firstRow) return 0;

    return firstRow.children.length;
  }, [rows]);

  const columns = useMemo(() => {
    return Array.from({ length: columnCount }, () => {
      const width = 250;

      return { width };
    });
  }, [columnCount]);

  const colGroup = useMemo(() => {
    if (!columns) return null;
    return <colgroup>
      {columns.map((column, index) => (
        <col
          key={index}
          style={{ width: `${column.width}px` }}
        />
      ))}
    </colgroup>;
  }, [columns]);

  return (
    <div {...attributes} data-block-type={element.type} className={`relative w-full overflow-auto appflowy-scrollbar`}>
      <table className={'row-header-hl w-full'}>
        {colGroup}
        <tbody className={'w-full'}>
        {children}
        </tbody>
      </table>
    </div>
  );
}

export default Table;