import { RenderElementProps } from 'slate-react';

function Code({ attributes, children, element }: RenderElementProps) {
  return (
    <div {...attributes} className="flex flex-col gap-4 bg-accent rounded-[8px] !p-2">
      <div className={'w-fit p-2 rounded-[8px] bg-muted'}>{element.data?.language as string}</div>
      <pre className={'p-2 pt-0'}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default Code;