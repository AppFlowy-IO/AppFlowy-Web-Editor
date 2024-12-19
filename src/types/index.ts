export * from './element';

import { Op } from 'quill-delta';

export interface AppFlowyEditor {
  applyData: (data: EditorData) => void;
  applyMarkdown: (markdown: string) => void;
}

export enum NodeType {
  Paragraph = 'paragraph',
  Heading = 'heading',
  NestedBlock = 'nested-block',
  Todo = 'todo_list',
  NumberedList = 'numbered_list',
  BulletedList = 'bulleted_list',
  Quote = 'quote',
  Code = 'code',
  LinkPreview = 'link_preview',
  Image = 'image',
  Divider = 'divider',
}

export enum InlineType {
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  Strikethrough = 'strikethrough',

  FontColor = 'font_color',
  BgColor = 'bg_color',
  Href = 'href',
}

export interface EditorNode {
  type: NodeType;
  children: EditorNode[];
  data?: Record<string, unknown>;
  delta?: Op[];
}

export type EditorData = EditorNode[];

export interface EditorLocale {
  // supported language: "en",
  //     "ar-SA",
  //     "ca-ES",
  //     "ckb-KU",
  //     "cs-CZ",
  //     "de-DE",
  //     "es-VE",
  //     "eu-ES",
  //     "fa",
  //     "fr-CA",
  //     "fr-FR",
  //     "he",
  //     "hu-HU",
  //     "id-ID",
  //     "it-IT",
  //     "ja-JP",
  //     "ko-KR",
  //     "pl-PL",
  //     "pt-BR",
  //     "pt-PT",
  //     "ru-RU",
  //     "sv-SE",
  //     "th-TH",
  //     "tr-TR",
  //     "uk-UA",
  //     "vi",
  //     "vi-VN",
  //     "zh-CN",
  //     "zh-TW"
  lang: string;
  resources?: Record<string, string>;
}

export interface EditorProps {
  initialValue?: EditorData;
  onChange?: (value: EditorData) => void;
  locale?: EditorLocale;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  modalZIndex?: number;
}

