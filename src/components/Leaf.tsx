import { RenderLeafProps } from 'slate-react';
import { renderColor } from '@/lib/color';

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  const style: React.CSSProperties = {};
  const classList = [leaf.prism_token, leaf.prism_token && 'token', leaf.class_name].filter(Boolean);

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.bg_color) {
    style.backgroundColor = renderColor(leaf.bg_color);
  }
  if (leaf.font_color) {
    style.color = renderColor(leaf.font_color);
  }

  const className = classList.join(' ');

  return <span {...attributes} className={className} style={style}>{children}</span>;
}

export default Leaf;