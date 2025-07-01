import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

type ElementData = Record<string, unknown>;

interface BaseElement {
  type: string;
  data?: ElementData;
  children: (BaseElement | CustomText)[];
}

interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  font_color?: string;
  bg_color?: string;
  href?: string;
  code?: boolean;
  font_family?: string;
  formula?: string;
  prism_token?: string;
  class_name?: string;
}

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: BaseElement;
    Text: CustomText;
  }
}
