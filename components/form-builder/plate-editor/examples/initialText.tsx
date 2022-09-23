/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@udecode/plate-test-utils";

jsx;

export const initialText: unknown = (
  <fragment>
    <hp>
      This is a paragraph with some <htext bold>Bold text</htext> and some{" "}
      <htext italic>Italic text</htext>.
    </hp>
    <hp>Here&apos;s some more text in a paragraph</hp>
    <hul>
      <hli>First item in the list</hli>
      <hli>
        <htext italic>This text is italic.</htext>
      </hli>
    </hul>
  </fragment>
);
