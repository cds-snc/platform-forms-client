import { InputNodeTypes } from "remark-slate";

const ELEMENT_BLOCKQUOTE = "blockquote";
const ELEMENT_CODE_BLOCK = "code_block";
const ELEMENT_CODE_LINE = "code_line";
const ELEMENT_EXCALIDRAW = "excalidraw";
const ELEMENT_H1 = "h1";
const ELEMENT_H2 = "h2";
const ELEMENT_H3 = "h3";
const ELEMENT_H4 = "h4";
const ELEMENT_H5 = "h5";
const ELEMENT_H6 = "h6";
const ELEMENT_IMAGE = "img";
const ELEMENT_LI = "li";
const ELEMENT_LIC = "lic";
const ELEMENT_LINK = "a";
const ELEMENT_MEDIA_EMBED = "media_embed";
const ELEMENT_MENTION = "mention";
const ELEMENT_MENTION_INPUT = "mention_input";
const ELEMENT_OL = "ol";
const ELEMENT_PARAGRAPH = "p";
const ELEMENT_TABLE = "table";
const ELEMENT_TD = "td";
const ELEMENT_TH = "th";
const ELEMENT_TODO_LI = "action_item";
const ELEMENT_TR = "tr";
const ELEMENT_UL = "ul";
const MARK_BOLD = "bold";
const MARK_CODE = "code";
const MARK_ITALIC = "italic";
const MARK_STRIKETHROUGH = "strikethrough";

export const plateNodeTypes: InputNodeTypes = {
  paragraph: ELEMENT_PARAGRAPH,
  block_quote: ELEMENT_BLOCKQUOTE,
  code_block: ELEMENT_CODE_BLOCK,
  link: ELEMENT_LINK,
  ul_list: ELEMENT_UL,
  ol_list: ELEMENT_OL,
  listItem: ELEMENT_LI,
  heading: {
    1: ELEMENT_H1,
    2: ELEMENT_H2,
    3: ELEMENT_H3,
    4: ELEMENT_H4,
    5: ELEMENT_H5,
    6: ELEMENT_H6,
  },
  emphasis_mark: MARK_ITALIC,
  strong_mark: MARK_BOLD,
  delete_mark: MARK_STRIKETHROUGH, //'strikeThrough',
  inline_code_mark: MARK_CODE, //'code',
  thematic_break: "thematic_break",
  image: ELEMENT_IMAGE,
};
