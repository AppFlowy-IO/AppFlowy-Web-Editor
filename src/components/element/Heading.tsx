import { RenderElementProps } from 'slate-react';
import { useMemo } from 'react';
import { HeadingData } from '@/types';

function Heading({ attributes, children, element }: RenderElementProps) {
  const data = useMemo(() => {
    return (element.data as HeadingData) || {};
  }, [element.data]);

  return (
    <div {...attributes} data-block-type={element.type} data-level={data.level}>{children}</div>
  );
}

export default Heading;