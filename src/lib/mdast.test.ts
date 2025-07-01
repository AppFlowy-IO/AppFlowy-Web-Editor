import { parseMarkdown } from "./mdast";
import { NodeType } from "../types";
import { EditorNode } from "../types";

describe("parseMarkdown - Line-based parsing", () => {
  // ==================== Heading parsing tests ====================
  describe("Heading parsing", () => {
    test("Basic heading parsing", () => {
      const markdown = `# Heading 1
## Heading 2
### Heading 3`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.Heading,
        data: { level: 1 },
        children: [],
        delta: [{ insert: "Heading 1" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.Heading,
        data: { level: 2 },
        children: [],
        delta: [{ insert: "Heading 2" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.Heading,
        data: { level: 3 },
        children: [],
        delta: [{ insert: "Heading 3" }],
      });
    });

    test("Headings with numeric prefixes", () => {
      const markdown = `# 1. First Chapter
## 2. Second Chapter
### 3.1 Third Chapter Subsection`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.Heading,
        data: { level: 1 },
        children: [],
        delta: [{ insert: "1. First Chapter" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.Heading,
        data: { level: 2 },
        children: [],
        delta: [{ insert: "2. Second Chapter" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.Heading,
        data: { level: 3 },
        children: [],
        delta: [{ insert: "3.1 Third Chapter Subsection" }],
      });
    });

    test("Headings with inline elements", () => {
      const markdown = `# **Important** Title
## Title with *italic* text
### Title with \`code\` block`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);

      // Check first heading (contains bold)
      expect(result[0].type).toBe(NodeType.Heading);
      expect(result[0].data).toEqual({ level: 1 });
      expect(result[0].delta).toHaveLength(2);
      expect(result[0].delta![0]).toMatchObject({
        insert: "Important",
        attributes: { bold: true },
      });
      expect(result[0].delta![1]).toMatchObject({ insert: " Title" });

      // Check second heading (contains italic)
      expect(result[1].type).toBe(NodeType.Heading);
      expect(result[1].data).toEqual({ level: 2 });
      expect(result[1].delta).toHaveLength(3);
      expect(result[1].delta![0]).toMatchObject({ insert: "Title with " });
      expect(result[1].delta![1]).toMatchObject({
        insert: "italic",
        attributes: { italic: true },
      });
      expect(result[1].delta![2]).toMatchObject({ insert: " text" });

      // Check third heading (contains code)
      expect(result[2].type).toBe(NodeType.Heading);
      expect(result[2].data).toEqual({ level: 3 });
      expect(result[2].delta).toHaveLength(3);
      expect(result[2].delta![0]).toMatchObject({ insert: "Title with " });
      expect(result[2].delta![1]).toMatchObject({
        insert: "code",
        attributes: { code: true },
      });
      expect(result[2].delta![2]).toMatchObject({ insert: " block" });
    });

    test("Headings with both numeric prefixes and inline elements", () => {
      const markdown = `# 1. **First Chapter**: *Important Content*
## 2.1 Chapter with \`code example\`
### 3.2.1 [Link Title](https://example.com)`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);

      // Check first heading (can now correctly parse all inline elements)
      expect(result[0].type).toBe(NodeType.Heading);
      expect(result[0].data).toEqual({ level: 1 });
      expect(result[0].delta).toHaveLength(4);
      expect(result[0].delta![0]).toMatchObject({ insert: "1. " });
      expect(result[0].delta![1]).toMatchObject({
        insert: "First Chapter",
        attributes: { bold: true },
      });
      expect(result[0].delta![2]).toMatchObject({ insert: ": " });
      expect(result[0].delta![3]).toMatchObject({
        insert: "Important Content",
        attributes: { italic: true },
      });

      // Check second heading
      expect(result[1].type).toBe(NodeType.Heading);
      expect(result[1].data).toEqual({ level: 2 });
      expect(result[1].delta).toHaveLength(2);
      expect(result[1].delta![0]).toMatchObject({
        insert: "2.1 Chapter with ",
      });
      expect(result[1].delta![1]).toMatchObject({
        insert: "code example",
        attributes: { code: true },
      });

      // Check third heading
      expect(result[2].type).toBe(NodeType.Heading);
      expect(result[2].data).toEqual({ level: 3 });
      expect(result[2].delta).toHaveLength(2);
      expect(result[2].delta![0]).toMatchObject({ insert: "3.2.1 " });
      expect(result[2].delta![1]).toMatchObject({
        insert: "Link Title",
        attributes: { href: "https://example.com" },
      });
    });
  });

  // ==================== Paragraph parsing tests ====================
  describe("Paragraph parsing", () => {
    test("Paragraphs without blank line separation", () => {
      const markdown = `First paragraph
Second paragraph
Third paragraph`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "First paragraph" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "Second paragraph" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "Third paragraph" }],
      });
    });

    test("Paragraphs with blank line separation", () => {
      const markdown = `First paragraph

Second paragraph

Third paragraph`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "First paragraph" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "Second paragraph" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "Third paragraph" }],
      });
    });
  });

  // ==================== Inline style parsing tests ====================
  describe("Inline style parsing", () => {
    test("Basic inline styles", () => {
      const markdown = `This is **bold** and *italic* plus \`code\``;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Paragraph);
      expect(result[0].delta).toBeInstanceOf(Array);
      expect(result[0].delta!.length).toBeGreaterThan(3);
    });

    test("Link parsing", () => {
      const markdown = `Click [here](https://example.com) for details`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Paragraph);
      expect(result[0].delta).toHaveLength(3);
      expect(result[0].delta![0]).toMatchObject({ insert: "Click " });
      expect(result[0].delta![1]).toMatchObject({
        insert: "here",
        attributes: { href: "https://example.com" },
      });
      expect(result[0].delta![2]).toMatchObject({ insert: " for details" });
    });

    test("Complex inline style combinations", () => {
      const markdown = `**bold***italic*\`code\`[link](url)normal text`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Paragraph);
      expect(result[0].delta!.length).toBeGreaterThan(3);
    });
  });

  // ==================== List parsing tests ====================
  describe("List parsing", () => {
    test("Unordered list", () => {
      const markdown = `- First item
- Second item
- Third item`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.BulletedList,
        children: [],
        delta: [{ insert: "First item" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.BulletedList,
        children: [],
        delta: [{ insert: "Second item" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.BulletedList,
        children: [],
        delta: [{ insert: "Third item" }],
      });
    });

    test("Ordered list", () => {
      const markdown = `1. First item
2. Second item
3. Third item`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.NumberedList,
        data: { number: 1 },
        children: [],
        delta: [{ insert: "First item" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.NumberedList,
        data: { number: 2 },
        children: [],
        delta: [{ insert: "Second item" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.NumberedList,
        data: { number: 3 },
        children: [],
        delta: [{ insert: "Third item" }],
      });
    });

    test("Task list", () => {
      const markdown = `- [x] Completed task
- [ ] Incomplete task
- [X] Uppercase X also counts as completed`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: NodeType.Todo,
        data: { checked: true },
        children: [],
        delta: [{ insert: "Completed task" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.Todo,
        data: { checked: false },
        children: [],
        delta: [{ insert: "Incomplete task" }],
      });
      expect(result[2]).toEqual({
        type: NodeType.Todo,
        data: { checked: true },
        children: [],
        delta: [{ insert: "Uppercase X also counts as completed" }],
      });
    });
  });

  // ==================== Other element parsing tests ====================
  describe("Other element parsing", () => {
    test("Blockquotes", () => {
      const markdown = `> This is a quote
> Second line of quote`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: NodeType.Quote,
        children: [],
        delta: [{ insert: "This is a quote" }],
      });
      expect(result[1]).toEqual({
        type: NodeType.Quote,
        children: [],
        delta: [{ insert: "Second line of quote" }],
      });
    });

    test("Various quote formats", () => {
      const markdown = `>
> 
>Direct content
> Standard format content`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(4);

      // Standalone >
      expect(result[0]).toEqual({
        type: NodeType.Quote,
        children: [],
        delta: [{ insert: "" }],
      });

      // > followed by space only
      expect(result[1]).toEqual({
        type: NodeType.Quote,
        children: [],
        delta: [{ insert: "" }],
      });

      // >direct content
      expect(result[2]).toEqual({
        type: NodeType.Quote,
        children: [],
        delta: [{ insert: "Direct content" }],
      });

      // > standard format
      expect(result[3]).toEqual({
        type: NodeType.Quote,
        children: [],
        delta: [{ insert: "Standard format content" }],
      });
    });

    test("Code blocks", () => {
      const markdown = `\`\`\`javascript
console.log('Hello World');
const x = 1;
\`\`\``;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: NodeType.Code,
        data: { language: "javascript" },
        children: [],
        delta: [{ insert: "console.log('Hello World');\nconst x = 1;" }],
      });
    });

    test("Horizontal rules", () => {
      const markdown = `Paragraph 1
---
Paragraph 2
***
Paragraph 3`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(5);
      expect(result[0].type).toBe(NodeType.Paragraph);
      expect(result[1].type).toBe(NodeType.Divider);
      expect(result[2].type).toBe(NodeType.Paragraph);
      expect(result[3].type).toBe(NodeType.Divider);
      expect(result[4].type).toBe(NodeType.Paragraph);
    });

    test("Tables", () => {
      const markdown = `| Col1 | Col2 | Col3 |
|-----|-----|-----|
| Val1 | Val2 | Val3 |
| Val4 | Val5 | Val6 |`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Table);
      expect(result[0].data).toEqual({
        enable_header_row: true,
        column_widths: { 0: 250, 1: 250, 2: 250 },
      });

      // Verify table structure: should have 3 rows (including header)
      expect(result[0].children).toHaveLength(3);

      // Verify first row (header)
      const headerRow = result[0].children[0];
      expect(headerRow.type).toBe(NodeType.TableRow);
      expect(headerRow.children).toHaveLength(3);

      // Verify header first cell
      const headerCell1 = headerRow.children[0];
      expect(headerCell1.type).toBe(NodeType.TableCell);
      expect(headerCell1.children).toHaveLength(1);
      expect(headerCell1.children[0].type).toBe(NodeType.Paragraph);
      expect(headerCell1.children[0].delta).toEqual([{ insert: "Col1" }]);

      // Verify header second cell
      const headerCell2 = headerRow.children[1];
      expect(headerCell2.type).toBe(NodeType.TableCell);
      expect(headerCell2.children[0].delta).toEqual([{ insert: "Col2" }]);

      // Verify header third cell
      const headerCell3 = headerRow.children[2];
      expect(headerCell3.type).toBe(NodeType.TableCell);
      expect(headerCell3.children[0].delta).toEqual([{ insert: "Col3" }]);

      // Verify second row data
      const dataRow1 = result[0].children[1];
      expect(dataRow1.type).toBe(NodeType.TableRow);
      expect(dataRow1.children).toHaveLength(3);
      expect(dataRow1.children[0].children[0].delta).toEqual([
        { insert: "Val1" },
      ]);
      expect(dataRow1.children[1].children[0].delta).toEqual([
        { insert: "Val2" },
      ]);
      expect(dataRow1.children[2].children[0].delta).toEqual([
        { insert: "Val3" },
      ]);

      // Verify third row data
      const dataRow2 = result[0].children[2];
      expect(dataRow2.type).toBe(NodeType.TableRow);
      expect(dataRow2.children).toHaveLength(3);
      expect(dataRow2.children[0].children[0].delta).toEqual([
        { insert: "Val4" },
      ]);
      expect(dataRow2.children[1].children[0].delta).toEqual([
        { insert: "Val5" },
      ]);
      expect(dataRow2.children[2].children[0].delta).toEqual([
        { insert: "Val6" },
      ]);
    });

    test("Tables with inline elements", () => {
      const markdown = `| **Bold Column** | *Italic Column* | \`Code Column\` |
|-----------|----------|----------|
| Plain text   | [Link](url) | Content     |`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Table);

      // Verify inline elements in header
      const headerRow = result[0].children[0];

      // Bold column
      const boldCell = headerRow.children[0];
      expect(boldCell.children[0].delta).toEqual([
        { insert: "Bold Column", attributes: { bold: true } },
      ]);

      // Italic column
      const italicCell = headerRow.children[1];
      expect(italicCell.children[0].delta).toEqual([
        { insert: "Italic Column", attributes: { italic: true } },
      ]);

      // Code column
      const codeCell = headerRow.children[2];
      expect(codeCell.children[0].delta).toEqual([
        { insert: "Code Column", attributes: { code: true } },
      ]);

      // Verify inline elements in data row
      const dataRow = result[0].children[1];

      // Plain text
      expect(dataRow.children[0].children[0].delta).toEqual([
        { insert: "Plain text" },
      ]);

      // Link
      expect(dataRow.children[1].children[0].delta).toEqual([
        { insert: "Link", attributes: { href: "url" } },
      ]);

      // Plain content
      expect(dataRow.children[2].children[0].delta).toEqual([
        { insert: "Content" },
      ]);
    });

    test("Complex table content", () => {
      const markdown = `| Feature | Status | Description |
|------|------|------|
| **Important Feature** | ✅ Complete | Contains *multiple* formatting with \`code\` |
| Regular Feature | 🚧 In Progress | [Reference docs](https://example.com) |`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Table);
      expect(result[0].children).toHaveLength(3); // Header + 2 data rows

      // Verify complex content in first row
      const complexRow = result[0].children[1];

      // First column: bold feature
      expect(complexRow.children[0].children[0].delta).toEqual([
        { insert: "Important Feature", attributes: { bold: true } },
      ]);

      // Second column: emoji status
      expect(complexRow.children[1].children[0].delta).toEqual([
        { insert: "✅ Complete" },
      ]);

      // Third column: mixed format content
      expect(complexRow.children[2].children[0].delta).toEqual([
        { insert: "Contains " },
        { insert: "multiple", attributes: { italic: true } },
        { insert: " formatting with " },
        { insert: "code", attributes: { code: true } },
      ]);

      // Verify second row link
      const linkRow = result[0].children[2];
      expect(linkRow.children[2].children[0].delta).toEqual([
        {
          insert: "Reference docs",
          attributes: { href: "https://example.com" },
        },
      ]);
    });
  });

  // ==================== Composite scenario tests ====================
  describe("Composite scenario tests", () => {
    test("Mixed content parsing", () => {
      const markdown = `# Title

This is a paragraph

- List item 1
- List item 2

> Quote content

\`\`\`
Code block
\`\`\`

Final paragraph`;

      const result = parseMarkdown(markdown);

      // Verify various elements are correctly parsed
      expect(result.length).toBeGreaterThan(5);
      expect(result[0].type).toBe(NodeType.Heading);
      expect(
        result.some((node: EditorNode) => node.type === NodeType.Paragraph)
      ).toBe(true);
      expect(
        result.some((node: EditorNode) => node.type === NodeType.BulletedList)
      ).toBe(true);
      expect(
        result.some((node: EditorNode) => node.type === NodeType.Quote)
      ).toBe(true);
      expect(
        result.some((node: EditorNode) => node.type === NodeType.Code)
      ).toBe(true);
    });

    test("Complex content in headings should not be misinterpreted as lists", () => {
      const markdown = `# 1. This is not a list
## 2. This is also not a list
### 1.1 Subsection title`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);
      // Ensure all are parsed as headings, not lists
      expect(
        result.every((node: EditorNode) => node.type === NodeType.Heading)
      ).toBe(true);
      expect(result[0].data).toEqual({ level: 1 });
      expect(result[1].data).toEqual({ level: 2 });
      expect(result[2].data).toEqual({ level: 3 });
    });
  });

  // ==================== Edge case tests ====================
  describe("Edge case tests", () => {
    test("Empty document", () => {
      const result = parseMarkdown("");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "" }],
      });
    });

    test("Document with only blank lines", () => {
      const result = parseMarkdown("\n\n\n");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: NodeType.Paragraph,
        children: [],
        delta: [{ insert: "" }],
      });
    });

    test("Incomplete code block", () => {
      const markdown = `\`\`\`javascript
console.log('Unclosed code block');`;

      const result = parseMarkdown(markdown);

      // Should treat incomplete code block as paragraphs
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.some((node: EditorNode) => node.type === NodeType.Paragraph)
      ).toBe(true);
    });

    test("Incomplete table", () => {
      const markdown = `| Col1 | Col2 |
| Only one line, no separator |`;

      const result = parseMarkdown(markdown);

      // Should treat incomplete table as paragraphs
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((node: EditorNode) => node.type === NodeType.Paragraph)
      ).toBe(true);
    });
  });

  // ==================== Nested sub-element tests ====================
  describe("Nested sub-element support", () => {
    test("Inline element nesting in tables", () => {
      const markdown = `| **Bold Column** | *Italic Column* | \`Code Column\` |
|-----------|----------|----------|
| Plain text   | [Link](url) | Content     |`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.Table);

      // Check nested structure of header first cell
      const headerRow = result[0].children[0];
      const firstCell = headerRow.children[0];
      expect(firstCell.type).toBe(NodeType.TableCell);
      expect(firstCell.children[0].type).toBe(NodeType.Paragraph);
      expect(firstCell.children[0].delta).toHaveLength(1);
      expect(firstCell.children[0].delta![0]).toMatchObject({
        insert: "Bold Column",
        attributes: { bold: true },
      });
    });

    test("Complex inline elements in list items", () => {
      const markdown = `- **Important**: Contains *multiple* \`formats\` in list item
- Plain list item
- Item with [link](https://example.com)`;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(3);

      // Check complex nesting in first list item
      expect(result[0].type).toBe(NodeType.BulletedList);
      expect(result[0].delta).toHaveLength(6); // Multiple inline elements
      expect(result[0].delta![0]).toMatchObject({
        insert: "Important",
        attributes: { bold: true },
      });
      expect(result[0].delta![1]).toMatchObject({ insert: ": Contains " });
      expect(result[0].delta![2]).toMatchObject({
        insert: "multiple",
        attributes: { italic: true },
      });
      expect(result[0].delta![3]).toMatchObject({
        insert: " ",
      });
      expect(result[0].delta![4]).toMatchObject({
        insert: "formats",
        attributes: { code: true },
      });
      expect(result[0].delta![5]).toMatchObject({
        insert: " in list item",
      });
    });

    test("Inline elements in quotes", () => {
      const markdown = `> This is a quote with **bold** and *italic*
> Second line with \`code\``;

      const result = parseMarkdown(markdown);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(NodeType.Quote);

      // Check inline element nesting in quotes
      expect(result[0].delta).toHaveLength(4);
      expect(result[0].delta![0]).toMatchObject({
        insert: "This is a quote with ",
      });
      expect(result[0].delta![1]).toMatchObject({
        insert: "bold",
        attributes: { bold: true },
      });
      expect(result[0].delta![2]).toMatchObject({ insert: " and " });
      expect(result[0].delta![3]).toMatchObject({
        insert: "italic",
        attributes: { italic: true },
      });
    });

    test("Currently unsupported nesting (shows areas for improvement)", () => {
      // Indented lists (ideally should form nested structure)
      const markdown = `- Main list item
  - Sub list item 1
  - Sub list item 2
- Another main list item`;

      const result = parseMarkdown(markdown);

      // Actually our parser can recognize indented lists!
      expect(result).toHaveLength(4);
      expect(result[0].type).toBe(NodeType.BulletedList);
      expect(result[1].type).toBe(NodeType.BulletedList); // Indented items also recognized as lists
      expect(result[2].type).toBe(NodeType.BulletedList);
      expect(result[3].type).toBe(NodeType.BulletedList);
    });

    test("Complex mixed nesting scenarios", () => {
      const markdown = `# Title with **bold**

Paragraph with *italic* and \`code\` plus [link](url).

- List item with **formatting** text
- Another list item

> Quote with *emphasis* text`;

      const result = parseMarkdown(markdown);

      // Verify various elements are correctly parsed with nested inline elements
      expect(result.length).toBeGreaterThan(4);

      // Bold in title
      expect(result[0].type).toBe(NodeType.Heading);
      expect(result[0].delta!.some((op) => op.attributes?.bold)).toBe(true);

      // Multiple inline elements in paragraph
      expect(result[1].type).toBe(NodeType.Paragraph);
      expect(result[1].delta!.length).toBeGreaterThan(4);

      // Formatting in list items
      expect(
        result.some(
          (node: EditorNode) =>
            node.type === NodeType.BulletedList &&
            node.delta!.some((op) => op.attributes?.bold)
        )
      ).toBe(true);

      // Italic in quotes
      expect(
        result.some(
          (node: EditorNode) =>
            node.type === NodeType.Quote &&
            node.delta!.some((op) => op.attributes?.italic)
        )
      ).toBe(true);
    });
  });
});
