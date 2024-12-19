import { RenderElementProps } from 'slate-react';
import { useEffect, useState } from 'react';

function LinkPreview({ attributes, children, element }: RenderElementProps) {
  const [data, setData] = useState<{
    image: { url: string };
    title: string;
    description: string;
  } | null>(null);
  const url = (element.data?.url as string) || '';
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!url) return;

    setData(null);
    void (async () => {
      try {
        setNotFound(false);
        const response = await fetch(`https://api.microlink.io/?url=${url}`);

        if (response.status !== 200) {
          setNotFound(true);
          return;
        }

        const data = await response.json();

        setData(data.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setNotFound(true);
      }
    })();
  }, [url]);

  return (
    <div {...attributes} onClick={() => {
      if (!url) return;
      window.open(url, '_blank');
    }} className={`flex bg-accent rounded-[8px] !p-2 gap-2 relative w-full cursor-pointer`}>
      {notFound ? (
        <div className={'flex w-full items-center justify-center'}>
          <div className={'text-text-title'}>Could not load preview</div>
        </div>
      ) : (
        <>
          <img
            src={data?.image?.url}
            alt={data?.title}
            className={'container h-full min-h-[48px] w-[25%] rounded bg-cover bg-center'}
          />
          <div className={'flex flex-col justify-center gap-2 overflow-hidden'}>
            <div
              className={
                'max-h-[48px] overflow-hidden whitespace-pre-wrap break-words text-base font-bold text-text-title'
              }
            >
              {data?.title}
            </div>
            <div
              className={
                'max-h-[64px] overflow-hidden truncate whitespace-pre-wrap break-words text-sm text-text-title'
              }
            >
              {data?.description}
            </div>
            <div className={'truncate whitespace-nowrap text-xs text-text-caption'}>{url}</div>
          </div>
        </>
      )}

      {children}
    </div>
  );
}

export default LinkPreview;