import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import LoadingDots from '@/components/ui/loading-dots';
import { useTranslation } from '@/i18n';
import { checkImage } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RenderElementProps } from 'slate-react';

function Image({ attributes, children, element }: RenderElementProps) {
  const url = (element.data?.url as string) || '';
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState<{
    ok: boolean;
    status: number;
    statusText: string;
  } | null>(null);

  const handleCheckImage = useCallback(async (url: string) => {
    setLoading(true);

    // Configuration for polling
    const maxAttempts = 5;         // Maximum number of polling attempts
    const pollingInterval = 6000;  // Time between attempts in milliseconds (3 seconds)
    const timeoutDuration = 30000; // Maximum time to poll in milliseconds (30 seconds)

    let attempts = 0;
    const startTime = Date.now();

    const attemptCheck: () => Promise<boolean> = async () => {
      try {
        const result = await checkImage(url);

        // Success case
        if (result.ok) {
          setImgError(null);
          setLoading(false);
          setLocalUrl(result.validatedUrl || url);
          return true;
        }

        // Error case but continue polling if within limits
        setImgError(result);

        // Check if we've exceeded our timeout or max attempts
        attempts++;
        const elapsedTime = Date.now() - startTime;

        if (attempts >= maxAttempts || elapsedTime >= timeoutDuration) {
          setLoading(false); // Stop loading after max attempts or timeout
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        return await attemptCheck();
        // eslint-disable-next-line
      } catch (e) {
        setImgError({ ok: false, status: 404, statusText: 'Image Not Found' });
        // Check if we should stop trying
        attempts++;
        const elapsedTime = Date.now() - startTime;

        if (attempts >= maxAttempts || elapsedTime >= timeoutDuration) {
          setLoading(false);
          return false;
        }

        // Continue polling after interval
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        return await attemptCheck();
      }
    };

    void attemptCheck();
  }, []);

  useEffect(() => {
    void handleCheckImage(url);
  }, [handleCheckImage, url]);
  
  const reloadImage = () => {
    void handleCheckImage(url);
  }

  const {t} = useTranslation();

  return (
    <div {...attributes} className={`relative  min-h-[100px] w-full`}>
      <img
        src={localUrl || url}
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
          <Alert variant="destructive" className={'flex gap-2 items-center justify-between w-full'}>
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

