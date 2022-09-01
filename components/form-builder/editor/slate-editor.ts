import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export type FormattedText = {
  text: string;
  bold?: true;
  italic?: true;
  align?: "left" | "center" | "right" | "justify";
};
export type CustomText = FormattedText;

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

export type HeadingElement = {
  type: "heading";
  level: number;
  children: CustomText[];
};

export type ListItem = {
  type: "list-item";
  align: "left" | "center" | "right" | "justify";
  children: CustomText[];
};

export type CustomElement = ParagraphElement | HeadingElement | ListItem;
export type Children = JSX.Element | JSX.Element[] | string | string[];
export type Format = "bold" | "italic";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
