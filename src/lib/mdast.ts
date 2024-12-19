import { fromMarkdown } from 'mdast-util-from-markdown';
import type { RootContent as Content, Root } from 'mdast';
import type { Descendant, Element as CustomElement, Text as CustomText } from 'slate';
import { NodeType } from '@/types';

interface FlatNode {
  type: string;
  depth: number;
  data?: Record<string, unknown>;
  text?: string;
  marks?: Array<{
    type: string;
    data?: string;
  }>;
}

interface TreeBuilderNode {
  children: Descendant[];
}

function flattenMdast(mdast: Content | Root): FlatNode[] {
  const flatNodes: FlatNode[] = [];

  function traverse(
    node: Content | Root,
    depth: number,
    listContext?: { type: NodeType, number?: number | null },
  ): void {
    switch (node.type) {
      case 'heading':
        flatNodes.push({
          type: NodeType.Heading,
          depth,
          data: {
            level: node.depth,
          },
        });
        if ('children' in node) {
          flattenChildren(node.children, depth + 1);
        }
        break;

      case 'paragraph':
        flatNodes.push({
          type: listContext?.type ? listContext.type : NodeType.Paragraph,
          depth,
        });
        if ('children' in node) {
          flattenChildren(node.children, depth + 1);
        }
        break;
      case 'blockquote':
        if ('children' in node) {
          flattenChildren(node.children, depth, {
            type: NodeType.Quote,
          });
        }
        break;

      case 'list': {
        const listType = node.ordered ? NodeType.NumberedList : NodeType.BulletedList;

        flattenChildren(node.children, depth, { type: listType, number: node.start });
        break;
      }

      case 'listItem':
        flatNodes.push({
          type: NodeType.NestedBlock,
          depth,
        });
        if ('children' in node) {
          const firstChild = node.children[0];
          if (firstChild && 'children' in firstChild) {
            flatNodes.push({
              type: listContext?.type || NodeType.BulletedList,
              depth: depth + 1,
              data: {
                number: listContext?.number || undefined,
                checked: node.checked || undefined,
              },
            });
            flattenChildren(firstChild.children, depth + 2);
          }

          flattenChildren(node.children.slice(1), depth + 1, listContext);
        }
        break;

      case 'text':
        flatNodes.push({
          type: 'text',
          depth,
          text: node.value,
        });
        break;

      case 'emphasis':
        if ('children' in node) {
          flattenChildren(node.children, depth, undefined, [{
            type: 'italic',
          }]);
        }
        break;

      case 'strong':
        if ('children' in node) {
          flattenChildren(node.children, depth, undefined, [{
            type: 'bold',
          }]);
        }
        break;

      case 'inlineCode':
        flatNodes.push({
          type: 'text',
          depth,
          text: node.value,
          marks: [{
            type: 'code',
          }],
        });
        break;

      case 'code': {
        flatNodes.push({
          type: NodeType.Code,
          depth,
          data: {
            language: node.lang || 'plain',
          },
        });
        flatNodes.push({
          type: 'text',
          depth: depth + 1,
          text: node.value,
        });
        break;
      }

      case 'link':
        flatNodes.push({
          type: NodeType.LinkPreview,
          depth: 0,
          data: {
            url: node.url,
          },
        });
        break;

      case 'image':
        flatNodes.push({
          type: NodeType.Image,
          depth: 0,
          data: {
            url: node.url,
          },
        });
        break;

      case 'thematicBreak':
        flatNodes.push({
          type: NodeType.Divider,
          depth,
        });
        break;
    }
  }

  function flattenChildren(
    children: Content[],
    depth: number,
    listContext?: { type: NodeType, number?: number | null },
    inheritedMarks: Array<{ type: string, data?: string }> = [],
  ): void {
    children.forEach(child => {
      if (child.type === 'text') {
        flatNodes.push({
          type: 'text',
          depth,
          text: child.value,
          marks: inheritedMarks,
        });
      } else {
        traverse(child, depth, listContext);
      }
    });
  }

  traverse(mdast, 0);
  return flatNodes;
}

function buildSlateTree(flatNodes: FlatNode[]): Descendant[] {
  function createSlateNode(node: FlatNode): Descendant {
    if (node.type === 'text') {
      const textNode: CustomText = { text: node.text || '' };
      if (node.marks) {
        node.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              textNode.bold = true;
              break;
            case 'italic':
              textNode.italic = true;
              break;
            case 'code':
              textNode.code = true;
              break;
            case 'href':
              textNode.href = mark.data;
              break;
          }
        });
      }
      return textNode;
    }

    return {
      type: node.type,
      data: node.data,
      children: [],
    };
  }

  const stack: TreeBuilderNode[] = [];
  let currentDepth = 0;
  let currentNode: TreeBuilderNode = { children: [] };
  let result = currentNode.children as Descendant[];

  flatNodes.forEach((node, index) => {
    if (node.depth === currentDepth) {
      if (stack.length > 0) {
        const parentNode = stack[stack.length - 1];
        (parentNode.children as Descendant[]).push(createSlateNode(node));
      } else {
        result.push(createSlateNode(node));
      }
    } else if (node.depth > currentDepth) {
      const prevNode = flatNodes[index - 1];
      if ([NodeType.Image, NodeType.LinkPreview].includes(prevNode.type as NodeType)) {
        result.push({
          type: NodeType.Paragraph,
          children: [createSlateNode(node)],
        });
        return;
      }
      stack.push(currentNode);
      const lastNode = result[result.length - 1] as CustomElement;
      currentNode = lastNode;
      result = lastNode.children;
      result.push(createSlateNode(node));
    } else {
      while (currentDepth > node.depth && stack.length > 0) {
        currentNode = stack.pop()!;
        result = currentNode.children as Descendant[];
        currentDepth--;
      }
      result.push(createSlateNode(node));
    }
    currentDepth = node.depth;
  });

  return (stack[0]?.children ?? result) as Descendant[];
}

export function markdownToSlateData(markdown: string): Descendant[] {
  const mdast = fromMarkdown(markdown);
  const flatNodes = mdast.children ? mdast.children.flatMap(node => flattenMdast(node)) : [];
  return buildSlateTree(flatNodes);
}
