import { CodeBlockElement, createPlateUI, StyledElement } from "@udecode/plate-ui";

import { withProps } from "@udecode/plate-common";
import { ELEMENT_CODE_BLOCK } from "@udecode/plate-code-block";
import { ELEMENT_PARAGRAPH } from "@udecode/plate-paragraph";

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
