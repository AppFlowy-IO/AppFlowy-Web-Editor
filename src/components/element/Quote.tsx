import { RenderElementProps } from 'slate-react';

function Quote({ attributes, children, element }: RenderElementProps) {
  return (
    <div {...attributes} data-block-type={element.type}>
      <div className={'border-l-4 border-primary ml-2 pl-3'}>{children}</div>
    </div>
  );
}

export default Quote;