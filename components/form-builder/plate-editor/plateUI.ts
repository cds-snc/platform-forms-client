import { CodeBlockElement, createPlateUI, StyledElement } from "@udecode/plate";

import { withProps } from "@udecode/plate";
import { ELEMENT_CODE_BLOCK } from "@udecode/plate";
import { ELEMENT_PARAGRAPH } from "@udecode/plate";

export const plateUI = createPlateUI({
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
    // as: 'p',
    styles: {
      root: {
        margin: 0,
        padding: "4px 0",
      },
    },
    prefixClassNames: "p",
  }),
});
