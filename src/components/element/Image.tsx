import { RenderElementProps } from 'slate-react';

function Image({ attributes, children, element }: RenderElementProps) {
  const url = (element.data?.url as string) || '';

  return (
    <div {...attributes} className={`relative w-full`}>
      <img
        src={url}
        alt={'Image'}
        className={'w-full h-full min-h-[48px] bg-cover bg-center'}
      />
      {children}
    </div>
  );
}

export default Image;