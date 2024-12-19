import { RenderElementProps } from 'slate-react';
import { NodeType } from '@/types';
import Heading from '@/components/element/Heading';
import Checkbox from '@/components/element/Checkbox';
import NumberedList from '@/components/element/NumberedList';
import BulletedList from '@/components/element/BulletedList';
import Quote from '@/components/element/Quote';
import LinkPreview from '@/components/element/LinkPreview';
import Image from '@/components/element/Image';
import Divider from '@/components/element/Divider';
import Code from '@/components/element/CodeBlock';

export function Element({
  element,
  attributes,
  children,
}: RenderElementProps) {

  switch (element.type) {
    case NodeType.Heading:
      return <Heading {...{ attributes, children, element }} />;
    case NodeType.Todo:
      return <Checkbox {...{ attributes, children, element }} />;
    case NodeType.NumberedList:
      return <NumberedList {...{ attributes, children, element }} />;
    case NodeType.BulletedList:
      return <BulletedList {...{ attributes, children, element }} />;
    case NodeType.Quote:
      return <Quote {...{ attributes, children, element }} />;
    case NodeType.LinkPreview:
      return <LinkPreview {...{ attributes, children, element }} />;
    case NodeType.Image:
      return <Image {...{ attributes, children, element }} />;
    case NodeType.Divider:
      return <Divider {...{ attributes, children, element }} />;
    case NodeType.Code:
      return <Code {...{ attributes, children, element }} />;
  }

  return (
    <div {...attributes} data-block-type={element.type}>{children}</div>
  );
}

export default Element;