import { RenderElementProps, useReadOnly } from 'slate-react';
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
import Table from '@/components/element/Table';
import TableRow from '@/components/element/TableRow';
import TableCell from '@/components/element/TableCell';

export function Element({
  element,
  attributes,
  children,
}: RenderElementProps) {
  const readOnly = useReadOnly();

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
      if (!readOnly) {
        break;
      }
      return <LinkPreview {...{ attributes, children, element }} />;
    case NodeType.Image:
      if (!readOnly) {
        break;
      }
      return <Image {...{ attributes, children, element }} />;
    case NodeType.Divider:
      if (!readOnly) {
        break;
      }
      return <Divider {...{ attributes, children, element }} />;
    case NodeType.Code:
      if (!readOnly) {
        break;
      }
      return <Code {...{ attributes, children, element }} />;
    case NodeType.Table:
      if (!readOnly) {
        break;
      }
      return <Table {...{ attributes, children, element }} />;
    case NodeType.TableRow:
      if (!readOnly) {
        break;
      }
      return <TableRow {...{ attributes, children, element }} />;
    case NodeType.TableCell:
      if (!readOnly) {
        break;
      }
      return <TableCell {...{ attributes, children, element }} />;
  }

  return (
    <div {...attributes} data-block-type={element.type}>{children}</div>
  );
}

export default Element;