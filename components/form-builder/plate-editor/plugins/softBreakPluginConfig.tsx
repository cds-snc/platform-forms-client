import {
  SoftBreakPlugin,
  ELEMENT_CODE_BLOCK,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_TD,
} from "@udecode/plate";

import { MyPlatePlugin } from "../types";

export const softBreakPluginConfig: Partial<MyPlatePlugin<SoftBreakPlugin>> = {
  options: {
    rules: [
      { hotkey: "shift+enter" },
      {
        hotkey: "enter",
        query: {
          allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
        },
      },
    ],
  },
};
