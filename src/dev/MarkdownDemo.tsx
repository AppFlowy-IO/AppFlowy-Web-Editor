import React, { useState, useEffect } from "react";
import { parseMarkdown } from "@/lib/mdast";
import { NodeType, EditorNode } from "@/types";
import { Editor, EditorProvider, useEditor } from "@/editor";
import { Op } from "quill-delta";

const DEMO_MARKDOWN = `# 1. **Complex Markdown** Parsing Demo

This is a demonstration document showcasing *advanced* markdown features.

## 2.1 Complex Heading Examples

### 3.1.1 Heading with **Bold** and *Italic* Text
#### 4. Heading with \`Code\` and [Links](https://appflowy.io)

## Inline Element Nesting Test

Here we have **bold text containing *nested italic* text**, and \`code with **bold** is invalid\`.

Contains multiple formats: **important**, *emphasis*, \`code\`, [AppFlowy Website](https://appflowy.io), and plain text.

## Complex List Structures

### Task Lists
- [x] Complete **important** task: task containing *formatted* text
- [ ] Task in progress: containing \`code examples\`
- [X] Another completed task: containing [reference link](https://example.com)

### Mixed Lists
1. First ordered item: containing **bold** text
2. Second ordered item: containing *italic* and \`code\`
   - Nested unordered item 1
   - Nested unordered item 2
3. Third ordered item

- Unordered list item 1: **important** information
- Unordered list item 2: containing [external link](https://github.com)
- Unordered list item 3: containing \`technical terms\`

## Quote Nesting

> **Important Notice**: This is a quote containing *formatted* text.
> 
> Quotes can also contain \`code\` and [links](https://example.com).
> 
> > This is a nested quote

## Edge Case Testing - Quote Formats

>
> 
>Quote directly followed by content
> Standard format quote

## Code Block Examples

### JavaScript Code
\`\`\`javascript
// Complex function example
function parseMarkdown(text) {
  const result = markdownToSlateData(text);
  return result.map(node => ({
    type: node.type,
    children: node.children
  }));
}

console.log('Hello, **World**!');
\`\`\`

### TypeScript Code
\`\`\`typescript
interface MarkdownNode {
  type: NodeType;
  data?: Record<string, unknown>;
  children: (BaseElement | CustomText)[];
}

const processNodes = (nodes: MarkdownNode[]): void => {
  nodes.forEach(node => console.log(node.type));
};
\`\`\`

## Advanced Tables

| **Feature** | *Status* | \`Priority\` | [Documentation Link](https://docs.appflowy.io) |
|----------|--------|------------|-------------------------------------|
| Heading Parsing | ✅ Complete | \`HIGH\` | [Heading Docs](https://example.com/headers) |
| List Parsing | ✅ Complete | \`MEDIUM\` | [List Docs](https://example.com/lists) |
| Table Parsing | 🚧 In Progress | \`LOW\` | [Table Docs](https://example.com/tables) |

## Horizontal Rules and Whitespace Handling

Content above

---

Content with horizontal rule in middle

***

Content below continues

## Edge Case Testing

### Empty Line Handling

There are empty lines here


Content resumes here

### Special Characters
Contains special characters: **bold**, *italic*, \`code\`, [link](url), and plain text \\*escaped\\*

### Incomplete Formatting
Here's unmatched **bold marker

Here's unmatched \`code marker

---

## Summary
This demo showcases the complex scenarios our markdown parser can handle, including:
- ✅ Nested inline elements
- ✅ Complex list structures  
- ✅ Formatted table content
- ✅ Multi-level headings
- ✅ Edge case handling`;

type ParsedNode = EditorNode;

const MarkdownDemoContent: React.FC = () => {
  const [markdown, setMarkdown] = useState(DEMO_MARKDOWN);
  const [parsedData, setParsedData] = useState<ParsedNode[]>(() =>
    parseMarkdown(DEMO_MARKDOWN)
  );
  const editor = useEditor();

  useEffect(() => {
    editor.applyMarkdown(markdown);
  }, [editor, markdown]);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value;
    setMarkdown(newMarkdown);

    try {
      const parsed = parseMarkdown(newMarkdown);
      setParsedData(parsed);
    } catch (error) {
      console.error("解析错误:", error);
    }
  };

  const renderNodeType = (node: ParsedNode): string => {
    switch (node.type) {
      case NodeType.Heading:
        return `Heading (Level: ${
          (node.data as Record<string, unknown>)?.level || "Unknown"
        })`;
      case NodeType.Paragraph:
        return "Paragraph";
      case NodeType.BulletedList:
        return "Bulleted List";
      case NodeType.NumberedList:
        return `Numbered List (Number: ${
          (node.data as Record<string, unknown>)?.number || "Unknown"
        })`;
      case NodeType.Todo:
        return `Task List (${
          (node.data as Record<string, unknown>)?.checked
            ? "Completed"
            : "Incomplete"
        })`;
      case NodeType.Quote:
        return "Quote";
      case NodeType.Code:
        return `Code Block (Language: ${
          (node.data as Record<string, unknown>)?.language || "plain"
        })`;
      case NodeType.Divider:
        return "Divider";
      case NodeType.Table:
        return "Table";
      case NodeType.TableRow:
        return "Table Row";
      case NodeType.TableCell:
        return "Table Cell";
      default:
        return node.type || "Unknown Node";
    }
  };

  const getTextContent = (node: ParsedNode): string => {
    // If has delta, extract text from it
    if (node.delta && Array.isArray(node.delta)) {
      return node.delta.map((op) => op.insert || "").join("");
    }

    // If has children, recursively process child nodes
    if (node.children && Array.isArray(node.children)) {
      return node.children
        .map((child) => getTextContent(child as ParsedNode))
        .join("");
    }

    return "";
  };

  const getDetailedContent = (node: ParsedNode): React.ReactNode => {
    // If has delta, show formatted inline elements
    if (node.delta && Array.isArray(node.delta)) {
      return (
        <div>
          {node.delta.map((op: Op, index: number) => (
            <div key={index} style={{ marginBottom: "2px", fontSize: "12px" }}>
              {op.attributes
                ? `"${op.insert}" [${Object.keys(op.attributes)
                    .map((key) =>
                      key === "href" ? `Link(${op.attributes![key]})` : key
                    )
                    .join(", ")}]`
                : `"${op.insert}"`}
            </div>
          ))}
        </div>
      );
    }

    // If has children, show child node information
    if (
      node.children &&
      Array.isArray(node.children) &&
      node.children.length > 0
    ) {
      return (
        <div>
          {node.children.map((child, index) => (
            <div key={index} style={{ marginBottom: "4px", fontSize: "12px" }}>
              <strong>{child.type}</strong>: {getTextContent(child)}
            </div>
          ))}
        </div>
      );
    }

    return "<Empty Content>";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "60vh 40vh",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}>
      {/* Top Row: Markdown Input and Parse Results */}
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {/* Left Side: Markdown Input */}
        <div
          style={{ flex: 1, padding: "20px", borderRight: "1px solid #ccc" }}>
          <h3>Complex Markdown Input</h3>
          <div
            style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            Supports: nested headings, inline elements, complex lists, tables,
            code blocks, etc.
          </div>
          <textarea
            value={markdown}
            onChange={handleMarkdownChange}
            style={{
              width: "100%",
              height: "calc(100% - 80px)",
              fontFamily: "Monaco, 'Courier New', monospace",
              fontSize: "13px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "12px",
              resize: "none",
              lineHeight: "1.4",
            }}
            placeholder="Enter complex Markdown here..."
          />
        </div>

        {/* Right Side: Parse Results */}
        <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
          <h3>Detailed Parse Results</h3>
          <div
            style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            Total: {parsedData.length} nodes | Supports nested sub-element
            display
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              maxHeight: "85%",
              overflow: "auto",
            }}>
            {parsedData.map((node, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  borderBottom:
                    index < parsedData.length - 1 ? "1px solid #eee" : "none",
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}>
                  <strong style={{ color: "#2563eb", fontSize: "14px" }}>
                    {renderNodeType(node)}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#666" }}>
                    #{index + 1}
                  </span>
                </div>

                {node.data && Object.keys(node.data).length > 0 && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "8px",
                      fontFamily: "Monaco, monospace",
                    }}>
                    数据: {JSON.stringify(node.data, null, 2)}
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "6px",
                    border: "1px solid #e9ecef",
                  }}>
                  <div
                    style={{
                      fontSize: "13px",
                      marginBottom: "6px",
                      color: "#495057",
                    }}>
                    <strong>Text Content:</strong>{" "}
                    {getTextContent(node) || "<Empty Content>"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6c757d" }}>
                    <strong>Detailed Structure:</strong>
                    {getDetailedContent(node)}
                  </div>
                </div>

                {node.children && node.children.length > 0 && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#888",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <span>Child nodes: {node.children.length}</span>
                    <span>
                      Type:{" "}
                      {node.children.every(
                        (child: EditorNode) => child.delta !== undefined
                      )
                        ? "Contains content"
                        : "Nested structure"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Actual Rendering Effect */}
      <div style={{ padding: "20px", overflow: "auto" }}>
        <h3>Actual Rendering Effect</h3>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
          Real-time rendering using AppFlowy editor, read-only mode - larger
          display space
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            height: "calc(100% - 80px)",
            overflow: "auto",
            backgroundColor: "#fff",
          }}>
          <div style={{ padding: "16px" }}>
            <Editor readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarkdownDemo: React.FC = () => {
  return (
    <EditorProvider>
      <MarkdownDemoContent />
    </EditorProvider>
  );
};
