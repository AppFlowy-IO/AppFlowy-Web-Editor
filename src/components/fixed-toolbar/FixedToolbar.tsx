import Color from './Color';
import List from '@/components/fixed-toolbar/List';
import Aa from '@/components/fixed-toolbar/Aa';
import { Separator } from '@/components/ui/separator';

export function FixedToolbar() {
  return (
    <div onMouseDown={e => {
      e.preventDefault();
      e.stopPropagation();
    }} className={'flex items-center py-3 px-4 flex-wrap gap-2'}>
      <Aa/>
      <Separator className={'h-4'} orientation={'vertical'}/>
      <List/>
      <Separator className={'h-4'} orientation={'vertical'}/>
      <Color/>
    </div>
  );
}

export default FixedToolbar;