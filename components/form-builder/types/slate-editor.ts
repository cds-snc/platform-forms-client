import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
export type CustomElement = { type: string; children: CustomText[] };
export type CustomText = { text: string; bold?: boolean; italic?: boolean };
export type Children = JSX.Element | JSX.Element[] | string | string[];
export type Format = "bold";
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
