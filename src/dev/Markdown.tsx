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

叔本华和尼采的哲学思想在某些方面存在相似之处，但也有显著的不同。以下是他们主张的相同点和不同点的对比：

| 方面               | 叔本华                                 | 尼采                                   |
|--------------------|----------------------------------------|----------------------------------------|
| **核心概念**       | 意志（Will）是生命的根本驱动力       | 权力意志（Will to Power）是生命的本能 |
| **对痛苦的看法**   | 生活充满痛苦，强调悲观主义           | 虽然承认痛苦，但认为痛苦是成长的必经之路 |
| **艺术的作用**     | 艺术是逃避痛苦、获得宁静的方式       | 艺术是生命的表现，强调创造力         |
| **宗教态度**       | 批判宗教，认为宗教是对痛苦的逃避     | 宣称“上帝已死”，强调个体的自主性     |
| **人性观**         | 人性本质上是自私和悲观的             | 强调个体的创造性和超越自我的可能性   |
| **价值观**         | 反对传统的道德观，认为道德源于同情心 | 提倡价值重估，反对绝对道德           |
| **个体与社会**     | 认为个体痛苦是普遍的，社会无法根本解决 | 强调个体的重要性，提倡超人哲学       |

### 总结
叔本华和尼采在对生命、痛苦和艺术的看法上有一些交集，但尼采在后期发展出更多强调个体创造性和积极性的观点，而叔本华则保持了悲观和对人性本质的深刻反思。这种对比展示了他们思想的复杂性和深度。

---

当然可以！下面是一个简单的 JavaScript demo，演示如何创建一个按钮，点击后显示当前时间。

\`\`\`html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>时间显示 Demo</title>
    <style>
        body        button        #time    </style>
</head>
<body>
    <h1>点击按钮显示当前时间</h1>
    <button id="showTimeBtn">显示当前时间</button>
    <div id="time"></div>

    <script>
        document.getElementById('showTimeBtn').addEventListener('click', function()    </script>
</body>
</html>
\`\`\`

这个代码片段创建了一个简单的网页，包含一个按钮和一个显示当前时间的区域。点击按钮后，页面会更新显示当前的时间。你可以把这段代码保存在一个 \`.html\` 文件中，然后在浏览器中打开查看效果。
End of document
`;

function Main() {
  const editor = useEditor();

  useEffect(() => {
    editor.applyMarkdown('# Loading...');
    setTimeout(() => {
      editor.applyMarkdown(markdown);
    }, 1000);
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