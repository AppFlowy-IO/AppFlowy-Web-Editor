import { Text, Element, Descendant } from 'slate';
import { Op } from 'quill-delta';
import { EditorNode, NodeType } from '@/types';

export function transformToSlateData(nodes: EditorNode[]): Element[] {
  return nodes.map(node => {
    if (!node.children || node.children.length === 0) {
      return {
        type: node.type as NodeType,
        data: node.data,
        children: deltaToSlateText(node.delta || []),
      };
    }

    return {
      type: NodeType.NestedBlock,
      children: [
        {
          type: node.type as NodeType,
          children: deltaToSlateText(node.delta || []),
        },
        ...transformToSlateData(node.children),
      ],
    };
  });
}

export function transformFromSlateData(nodes: Descendant[]): EditorNode[] {
  return nodes.map(node => {
    if (!Element.isElement(node)) {
      return {
        type: NodeType.Paragraph,
        delta: slateTextToDelta([node as Text]),
        children: [],
      };
    }

    if (node.type !== NodeType.NestedBlock) {
      return {
        type: node.type as NodeType,
        data: node.data,
        delta: slateTextToDelta(node.children || []),
        children: [],
      };
    }

    const [mainParagraph, ...nestedParagraphs] = node.children as Element[];
    return {
      type: mainParagraph.type as NodeType,
      data: node.data,
      delta: slateTextToDelta(mainParagraph.children || []),
      children: transformFromSlateData(nestedParagraphs),
    };
  });
}

export function deltaToSlateText(delta: Op[]): Text[] {
  return delta.map(op => {
    const { insert, attributes } = op;
    return {
      text: insert as string,
      ...attributes,
    };
  });
}

export function slateTextToDelta(texts: Text[]): Op[] {
  return texts.map(({ text, ...attributes }) => ({
    insert: text,
    attributes,
  }));
}