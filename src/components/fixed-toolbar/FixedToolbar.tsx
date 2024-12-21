import { Separator } from '@/components/ui/separator';

import Color from './Color';
import BUIS from '@/components/fixed-toolbar/BIUS';
import List from '@/components/fixed-toolbar/List';
import Aa from '@/components/fixed-toolbar/Aa';
import Heading from '@/components/fixed-toolbar/Heading';

export function FixedToolbar() {

  return (
    <div onMouseDown={e => {
      e.preventDefault();
      e.stopPropagation();
    }} className={'flex items-center py-3 px-4 flex-wrap gap-1.5'}>
      <Aa/>
      <Heading/>
      <List/>
      <Separator orientation={'vertical'} className={'!h-4'}/>
      <BUIS/>
      <Color/>
    </div>
  );
}

export default FixedToolbar;