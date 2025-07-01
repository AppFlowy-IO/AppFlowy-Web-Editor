import { ElementData } from "../@types/editor";

export interface HeadingData extends ElementData {
  level: number;
}

export interface CheckboxData extends ElementData {
  checked?: boolean;
}

export interface NumberedListData extends ElementData {
  number?: number;
}
