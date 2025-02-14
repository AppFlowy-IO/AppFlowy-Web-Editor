import { Button } from '@/components/ui/button';
import LoadingDots from '@/components/ui/loading-dots';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { RenderElementProps } from 'slate-react';
import { AlertCircle  } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function Image({ attributes, children, element }: RenderElementProps) {
  const url = (element.data?.url as string) || '';
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState<{
    ok: boolean;
    status: number;
    statusText: string;
  } | null>(null);
  
  const handleCheckImage = async (url: string) => {
    setLoading(true);
    checkImage(url).then(result => {
      if (!result.ok) {
        setImgError(result);
      } else {
        setImgError(null);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    void handleCheckImage(url);
  }, [url]);
  
  const reloadImage = () => {
    void handleCheckImage(url);
  }

  const {t} = useTranslation();

  return (
    <div {...attributes} className={`relative  min-h-[100px] w-full`}>
      <img
        src={url}
        alt={''}
        onLoad={() => {
          setLoading(false);
          setImgError(null);
        }}
        style={{
          visibility: imgError ? 'hidden' : 'visible',
        }}
        className={'w-full h-full bg-cover bg-center'}
      />
      {children}
      {loading ? (
        <div className={'absolute bg-background flex items-center inset-0 justify-center w-full h-full'}>
          <LoadingDots />
        </div>
      ) : imgError ? (
        <div className={'absolute bg-background flex inset-0 justify-center w-full h-full'}>
          <Alert variant="destructive" className={'flex items-center justify-between w-full'}>
            <div className={'relative overflow-hidden w-full [&>svg]:absolute [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-7'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription className={'w-full truncate'}>
                {t('imageLoadError', {
                  error: imgError.statusText,
                })}
              </AlertDescription>
            </div>

            <Button
              onClick={reloadImage}
            >
              {t('reloadImage')}
            </Button>
          </Alert>

        </div>
      ) : null}
    </div>
  );
}

export default Image;

const checkImage = async (url: string) => {
  try {
    const response = await fetch(url);
    console.log(response);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText || "Status Text Not Available, and status code is " + response.status,
      };
    }
    return {
      ok: true,
      status: response.status,
      statusText: response.statusText,
    };
    // eslint-disable-next-line
  } catch (e) {
    return {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    };
  }
};