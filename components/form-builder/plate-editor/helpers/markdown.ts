import {
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LINK,
  MARK_CODE,
  MARK_ITALIC,
  MARK_BOLD,
  MARK_STRIKETHROUGH,
  ELEMENT_IMAGE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_HR,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LI,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from "@udecode/plate";
import { serialize } from "remark-slate";

export const serializeMd = (value) => {
  return serialize(
    { children: value },
    {
      nodeTypes: {
        paragraph: ELEMENT_PARAGRAPH,
        block_quote: ELEMENT_BLOCKQUOTE,
        link: ELEMENT_LINK,
        inline_code_mark: MARK_CODE,
        emphasis_mark: MARK_ITALIC,
        strong_mark: MARK_BOLD,
        delete_mark: MARK_STRIKETHROUGH,
        // NOTE: underline, subscript superscript not yet supported by remark-slate
        // underline: MARK_UNDERLINE,
        // subscript: MARK_SUBSCRIPT,
        // superscript: MARK_SUPERSCRIPT,
        image: ELEMENT_IMAGE,
        code_block: ELEMENT_CODE_BLOCK,
        thematic_break: ELEMENT_HR,
        ul_list: ELEMENT_UL,
        ol_list: ELEMENT_OL,
        listItem: ELEMENT_LI,
        heading: {
          1: ELEMENT_H1,
          2: ELEMENT_H2,
          4: ELEMENT_H4,
          3: ELEMENT_H3,
          5: ELEMENT_H5,
          6: ELEMENT_H6,
        },
      },
    }
  );
};
