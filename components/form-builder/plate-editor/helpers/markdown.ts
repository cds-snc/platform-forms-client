import serialize from "./serialize";
import { Value } from "@udecode/plate";

export const serializeMd = (value: Value) => {
  return serialize(
    { children: value },
    {
      nodeTypes: {
        paragraph: "paragraph",
        block_quote: "block_quote",
        link: "link",
        inline_code_mark: "code",
        emphasis_mark: "italic",
        strong_mark: "bold",
        delete_mark: "strikeThrough",
        // NOTE: underline, subscript superscript not yet supported by remark-slate
        // underline: MARK_UNDERLINE,
        // subscript: MARK_SUBSCRIPT,
        // superscript: MARK_SUPERSCRIPT,
        image: "image",
        code_block: "code_block",
        thematic_break: "thematic_break",
        ul_list: "ul_list",
        ol_list: "ol_list",
        listItem: "list_item",
        heading: {
          1: "heading_one",
          2: "heading_two",
          3: "heading_three",
          4: "heading_four",
          5: "heading_five",
          6: "heading_six",
        },
      },
    }
  );
};
