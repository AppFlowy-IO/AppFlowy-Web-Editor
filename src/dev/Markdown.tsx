import { Editor, EditorProvider, useEditor } from '@/editor';
import { useEffect } from 'react';

const markdown = `
# Heading

Paragraph 1

  Paragraph 2

* List item 1
  * Nested item
    with **bold** text
* List item 2
  > Quoted text
  And normal text

1. Ordered item
   000000
   * Nested bullet
2. Another item
   > With quote
   
   123. Nested ordered
   
   > And more quote

- [ ] Todo item
- [x] Completed item
  With nested content
  
\`\`\`js
console.log('Hello, world!');
\`\`\`

[Link](https://appflowy.io) ---=;
12333

![Image](https://appflowy.io/_next/static/media/og-image.838814e7.png) 12333

333

---

End of document
`;

function Main() {
  const editor = useEditor();

  useEffect(() => {
    editor.applyMarkdown(markdown);
  }, [editor]);

  return <Editor readOnly/>;
}

function Markdown() {
  return (
    <EditorProvider>
      <Main/>
    </EditorProvider>
  );
}

export default Markdown;