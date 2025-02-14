import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

import type { RootContent as Content, Root } from 'mdast';
import type { Descendant, Text as CustomText } from 'slate';
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
      case 'table':
        console.log('table');
        flatNodes.push({
          type: NodeType.Table,
          depth,
          data: {},
        });
        if ('children' in node) {
          flattenChildren(node.children, depth + 1);
        }
        break;

      case 'tableRow':
        flatNodes.push({
          type: NodeType.TableRow,
          depth,
          data: {}
        });
        if ('children' in node) {
          flattenChildren(node.children, depth + 1);
        }
        break;

      case 'tableCell':
        flatNodes.push({
          type: NodeType.TableCell,
          depth,
        });
        if ('children' in node) {
          flattenChildren(node.children, depth + 1);
        }
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

  // Initialize root node and stack
  const root: TreeBuilderNode = { children: [] };
  const stack: TreeBuilderNode[] = [root];
  let currentDepth = 0;

  flatNodes.forEach((node, index) => {
    // Adjust stack until it matches current depth
    if (node.depth < currentDepth) {
      while (currentDepth > node.depth) {
        stack.pop();
        currentDepth--;
      }
    } else if (node.depth > currentDepth) {
      // Handle child nodes of special nodes by creating a new paragraph node
      const prevNode = flatNodes[index - 1];
      if (prevNode && [NodeType.Image, NodeType.LinkPreview].includes(prevNode.type as NodeType)) {
        const paragraphNode = {
          type: NodeType.Paragraph,
          children: [],
        };
        stack[stack.length - 1].children.push(paragraphNode);
        stack.push(paragraphNode);
      } else {
        // Use the last created node as the new parent
        const parent = stack[stack.length - 1];
        if (parent.children.length === 0) {
          // If parent has no children, create a new node
          const newNode = createSlateNode(node);
          parent.children.push(newNode);
          if ('children' in newNode) {
            stack.push(newNode as TreeBuilderNode);
          }
        } else {
          // Use the last child as the new parent
          const lastChild = parent.children[parent.children.length - 1] as TreeBuilderNode;
          stack.push(lastChild);
        }
      }
      currentDepth = node.depth;
    }

    // Get current parent node from stack
    const currentParent = stack[stack.length - 1];

    // Create new node
    const newNode = createSlateNode(node);

    // Add node to current parent if it's a text node or has same depth
    if (node.type === 'text' || node.depth === currentDepth) {
      currentParent.children.push(newNode);
    }
  });

  return root.children as Descendant[];
}

export function markdownToSlateData(markdown: string): Descendant[] {
  const mdast = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });
  const flatNodes = mdast.children ? mdast.children.flatMap(node => flattenMdast(node)) : [];
  return buildSlateTree(flatNodes);
}
