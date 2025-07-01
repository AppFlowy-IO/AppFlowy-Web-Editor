import { NodeType, EditorData, EditorNode } from "../types";
import { Op } from "quill-delta";

interface LineParseResult {
  type: NodeType;
  content: string;
  data?: Record<string, unknown>;
  indent: number;
  raw: string;
}

/**
 * Parse inline elements to delta format
 */
function parseInlineElements(text: string): Op[] {
  if (!text.trim()) {
    return [{ insert: "" }];
  }

  // Use placeholder system to avoid overlap issues
  const placeholders: Array<{
    id: string;
    op: Op;
  }> = [];
  let processedText = text;
  let placeholderCounter = 0;

  // Process various formats in priority order
  const patterns = [
    // 1. Inline code `code`
    {
      regex: /`([^`]+)`/g,
      createOp: (match: RegExpExecArray): Op => ({
        insert: match[1],
        attributes: { code: true },
      }),
    },
    // 2. Links [text](url)
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/g,
      createOp: (match: RegExpExecArray): Op => ({
        insert: match[1],
        attributes: { href: match[2] },
      }),
    },
    // 3. Bold **text** or __text__
    {
      regex: /\*\*([^*]+)\*\*/g,
      createOp: (match: RegExpExecArray): Op => ({
        insert: match[1],
        attributes: { bold: true },
      }),
    },
    {
      regex: /__([^_]+)__/g,
      createOp: (match: RegExpExecArray): Op => ({
        insert: match[1],
        attributes: { bold: true },
      }),
    },
    // 4. Italic *text* or _text_
    {
      regex: /\*([^*]+)\*/g,
      createOp: (match: RegExpExecArray): Op => ({
        insert: match[1],
        attributes: { italic: true },
      }),
    },
    {
      regex: /_([^_]+)_/g,
      createOp: (match: RegExpExecArray): Op => ({
        insert: match[1],
        attributes: { italic: true },
      }),
    },
  ];

  // Process each format progressively
  patterns.forEach((pattern) => {
    const regex = new RegExp(pattern.regex.source, "g");
    let match;

    while ((match = regex.exec(processedText)) !== null) {
      const placeholderId = `{{PLACEHOLDER${placeholderCounter}}}`;
      placeholderCounter++;

      // Create delta operation
      const op = pattern.createOp(match);
      placeholders.push({ id: placeholderId, op });

      // Replace matched text with placeholder
      processedText =
        processedText.substring(0, match.index) +
        placeholderId +
        processedText.substring(match.index + match[0].length);

      // Reset regex lastIndex
      regex.lastIndex = match.index + placeholderId.length;
    }
  });

  // Split processed text and rebuild as Op array
  const result: Op[] = [];
  const parts = processedText.split(/({{PLACEHOLDER\d+}})/);

  parts.forEach((part) => {
    if (part.startsWith("{{PLACEHOLDER")) {
      // Find corresponding placeholder and replace with delta operation
      const placeholder = placeholders.find((p) => p.id === part);
      if (placeholder) {
        result.push(placeholder.op);
      }
    } else if (part) {
      // Plain text
      result.push({ insert: part });
    }
  });

  // If no results, return original text
  if (result.length === 0) {
    result.push({ insert: text });
  }

  return result;
}

/**
 * Parse single line and determine block type
 */
function parseLine(line: string): LineParseResult {
  const trimmed = line.trim();
  const indent = line.length - line.trimStart().length;

  // Empty line
  if (!trimmed) {
    return {
      type: NodeType.Paragraph,
      content: "",
      indent,
      raw: line,
    };
  }

  // Headings (# ## ### #### ##### ######)
  const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    return {
      type: NodeType.Heading,
      content: headingMatch[2],
      data: { level: headingMatch[1].length },
      indent,
      raw: line,
    };
  }

  // Horizontal rules
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
    return {
      type: NodeType.Divider,
      content: "",
      indent,
      raw: line,
    };
  }

  // Blockquotes
  if (trimmed.startsWith(">")) {
    // Handle various quote formats:
    // ">" - empty quote
    // "> " - empty quote with space
    // ">content" - quote directly followed by content
    // "> content" - standard quote format
    let content = "";
    if (trimmed.length === 1) {
      // Standalone ">"
      content = "";
    } else if (trimmed.startsWith("> ")) {
      // "> content" or "> "
      content = trimmed.substring(2);
    } else {
      // ">content"
      content = trimmed.substring(1);
    }

    return {
      type: NodeType.Quote,
      content,
      indent,
      raw: line,
    };
  }

  // Code block start/end
  if (trimmed.startsWith("```")) {
    const language = trimmed.substring(3).trim() || "plain";
    return {
      type: NodeType.Code,
      content: "",
      data: { language },
      indent,
      raw: line,
    };
  }

  // Task list/checkbox (must check before unordered list)
  const taskListMatch = trimmed.match(/^[-*+]\s+\[([xX\s])\]\s+(.*)$/);
  if (taskListMatch) {
    return {
      type: NodeType.Todo,
      content: taskListMatch[2],
      data: { checked: taskListMatch[1].toLowerCase() === "x" },
      indent,
      raw: line,
    };
  }

  // Unordered list
  const unorderedListMatch = trimmed.match(/^[-*+]\s+(.*)$/);
  if (unorderedListMatch) {
    return {
      type: NodeType.BulletedList,
      content: unorderedListMatch[1],
      indent,
      raw: line,
    };
  }

  // Ordered list
  const orderedListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
  if (orderedListMatch) {
    return {
      type: NodeType.NumberedList,
      content: orderedListMatch[2],
      data: { number: parseInt(orderedListMatch[1]) },
      indent,
      raw: line,
    };
  }

  // Table row (simple detection)
  if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
    return {
      type: NodeType.Table,
      content: trimmed,
      indent,
      raw: line,
    };
  }

  // Default to paragraph
  return {
    type: NodeType.Paragraph,
    content: trimmed,
    indent,
    raw: line,
  };
}

/**
 * Handle table parsing
 */
function parseTable(tableLines: LineParseResult[]): EditorNode[] {
  if (tableLines.length < 2) return [];

  const headerLine = tableLines[0];
  const separatorLine = tableLines[1];

  // Validate if it's a valid table
  if (!separatorLine.content.match(/^[\s|:-]+$/)) {
    // If not a valid table, treat as regular paragraphs
    return tableLines.map((line) => ({
      type: NodeType.Paragraph,
      children: [],
      delta: parseInlineElements(line.content),
    }));
  }

  const headerCells = headerLine.content
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell);
  const columnWidths: { [key: number]: number } = {};

  for (let i = 0; i < headerCells.length; i++) {
    columnWidths[i] = 250; // Default width
  }

  const table: EditorNode = {
    type: NodeType.Table,
    data: {
      enable_header_row: true,
      column_widths: columnWidths,
    },
    children: [],
  };

  // Process table rows (skip separator row)
  const dataLines = [headerLine, ...tableLines.slice(2)];

  for (const line of dataLines) {
    const cells = line.content
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell);
    const rowChildren: EditorNode[] = [];

    for (const cellContent of cells) {
      rowChildren.push({
        type: NodeType.TableCell,
        children: [
          {
            type: NodeType.Paragraph,
            children: [],
            delta: parseInlineElements(cellContent),
          },
        ],
      });
    }

    table.children.push({
      type: NodeType.TableRow,
      data: {},
      children: rowChildren,
    });
  }

  return [table];
}

/**
 * Handle code block processing
 */
function parseCodeBlock(codeLines: LineParseResult[]): EditorNode[] {
  if (codeLines.length < 2) return [];

  const startLine = codeLines[0];
  const endLine = codeLines[codeLines.length - 1];

  // Validate code block format
  if (
    !startLine.raw.trim().startsWith("```") ||
    !endLine.raw.trim().startsWith("```")
  ) {
    // If format is incorrect, treat as regular paragraphs
    return codeLines.map((line) => ({
      type: NodeType.Paragraph,
      children: [],
      delta: parseInlineElements(line.content),
    }));
  }

  const codeContent = codeLines
    .slice(1, -1)
    .map((line) => line.raw)
    .join("\n");

  return [
    {
      type: NodeType.Code,
      data: startLine.data,
      children: [],
      delta: [{ insert: codeContent }],
    },
  ];
}

/**
 * Line-based markdown conversion, returns EditorData format
 */
export function parseMarkdown(markdown: string): EditorData {
  const lines = markdown.split("\n");
  const parsedLines = lines.map((line) => parseLine(line));
  const result: EditorNode[] = [];

  let i = 0;
  while (i < parsedLines.length) {
    const currentLine = parsedLines[i];

    // Skip empty lines but preserve empty paragraph semantics
    if (
      !currentLine.content.trim() &&
      currentLine.type === NodeType.Paragraph
    ) {
      i++;
      continue;
    }

    // Handle code blocks
    if (
      currentLine.type === NodeType.Code &&
      currentLine.raw.trim().startsWith("```")
    ) {
      const codeBlockLines = [currentLine];
      i++;

      // Find code block end
      while (i < parsedLines.length) {
        const line = parsedLines[i];
        codeBlockLines.push(line);

        if (line.raw.trim().startsWith("```")) {
          break;
        }
        i++;
      }

      result.push(...parseCodeBlock(codeBlockLines));
      i++;
      continue;
    }

    // Handle tables
    if (currentLine.type === NodeType.Table) {
      const tableLines = [currentLine];
      i++;

      // Collect consecutive table rows
      while (i < parsedLines.length && parsedLines[i].type === NodeType.Table) {
        tableLines.push(parsedLines[i]);
        i++;
      }

      result.push(...parseTable(tableLines));
      continue;
    }

    // Handle lists (with nesting support)
    if (
      [NodeType.BulletedList, NodeType.NumberedList, NodeType.Todo].includes(
        currentLine.type
      )
    ) {
      const listItems: EditorNode[] = [];

      while (i < parsedLines.length) {
        const line = parsedLines[i];

        // If not the same type of list item, break out
        if (
          ![
            NodeType.BulletedList,
            NodeType.NumberedList,
            NodeType.Todo,
          ].includes(line.type)
        ) {
          break;
        }

        // Process current list item
        const listItem: EditorNode = {
          type: line.type,
          data: line.data,
          children: [],
          delta: parseInlineElements(line.content),
        };

        listItems.push(listItem);
        i++;
      }

      result.push(...listItems);
      continue;
    }

    // Handle regular block elements
    const blockNode: EditorNode = {
      type: currentLine.type,
      ...(currentLine.data && { data: currentLine.data }),
      children: [],
      delta: parseInlineElements(currentLine.content),
    };

    result.push(blockNode);
    i++;
  }

  // If result is empty, return an empty paragraph
  if (result.length === 0) {
    result.push({
      type: NodeType.Paragraph,
      children: [],
      delta: [{ insert: "" }],
    });
  }

  return result;
}
