/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { HeadingTagType } from "@lexical/rich-text";
import { COMMAND_PRIORITY_NORMAL, KEY_MODIFIER_COMMAND } from "lexical";
import { Dispatch, useEffect } from "react";

import { useToolbarState } from "../../context/ToolbarContext";
import {
  formatBulletList,
  formatHeading,
  formatNumberedList,
  formatParagraph,
} from "../ToolbarPlugin/utils";
import {
  isFormatBulletList,
  isFormatHeading,
  isFormatNumberedList,
  isFormatParagraph,
  isInsertLink,
} from "./shortcuts";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function ShortcutsPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): null {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = useToolbarState();

  useEffect(() => {
    const keyboardShortcutsHandler = (payload: KeyboardEvent) => {
      const event: KeyboardEvent = payload;

      if (isFormatParagraph(event)) {
        event.preventDefault();
        formatParagraph(editor);
      } else if (isFormatHeading(event)) {
        event.preventDefault();
        if (!["2", "3"].includes(event.code[event.code.length - 1])) {
          return false;
        }
        const { code } = event;
        const headingSize = `h${code[code.length - 1]}` as HeadingTagType;
        formatHeading(editor, toolbarState.blockType, headingSize);
      } else if (isFormatBulletList(event)) {
        event.preventDefault();
        formatBulletList(editor, toolbarState.blockType);
      } else if (isFormatNumberedList(event)) {
        event.preventDefault();
        formatNumberedList(editor, toolbarState.blockType);
      } else if (isInsertLink(event)) {
        event.preventDefault();
        const url = toolbarState.isLink ? null : "";
        setIsLinkEditMode(!toolbarState.isLink);

        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }

      return false;
    };

    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      keyboardShortcutsHandler,
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor, toolbarState.isLink, toolbarState.blockType, setIsLinkEditMode]);

  return null;
}
