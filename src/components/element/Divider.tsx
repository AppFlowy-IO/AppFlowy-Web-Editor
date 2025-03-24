import { RenderElementProps } from 'slate-react';

function Divider({ attributes, children, element }: RenderElementProps) {
  return (
    <div {...attributes} data-block-type={element.type} className={'bg-accent !p-0 w-full h-[1px] my-2'}>{children}</div>
  );
}

export default Divider;