import { Text, Element, Descendant } from "slate";
import { Op } from "quill-delta";
import { EditorNode, NodeType } from "@/types";

export function transformToSlateData(nodes: EditorNode[]): Element[] {
  return nodes.map((node) => {
    if (!node.children || node.children.length === 0) {
      return {
        type: node.type as NodeType,
        data: node.data,
        children: deltaToSlateText(node.delta || []),
      };
    }

    if (
      node.type === NodeType.Table ||
      node.type === NodeType.TableRow ||
      node.type === NodeType.TableCell
    ) {
      return {
        type: node.type as NodeType,
        data: node.data,
        children: transformToSlateData(node.children),
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
  return nodes.map((node) => {
    if (!Element.isElement(node)) {
      return {
        type: NodeType.Paragraph,
        delta: slateTextToDelta([node as Text]),
        children: [],
      };
    }

    if (node.children.length > 0 && "type" in node.children[0]) {
      if (node.type === NodeType.NestedBlock) {
        const [mainParagraph, ...nestedParagraphs] = node.children as Element[];
        return {
          type: mainParagraph.type as NodeType,
          data: node.data,
          delta: slateTextToDelta(mainParagraph.children as Text[]),
          children: transformFromSlateData(nestedParagraphs),
        };
      } else {
        return {
          type: node.type as NodeType,
          data: node.data,
          children: transformFromSlateData(node.children),
        };
      }
    }

    return {
      type: node.type as NodeType,
      data: node.data,
      delta: slateTextToDelta(node.children as Text[]),
      children: [],
    };
  });
}

export function deltaToSlateText(delta: Op[]): Text[] {
  return delta.map((op) => {
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
