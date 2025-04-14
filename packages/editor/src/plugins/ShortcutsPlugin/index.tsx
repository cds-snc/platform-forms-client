/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { HeadingTagType } from "@lexical/rich-text";
import {
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import { Dispatch, useEffect } from "react";

import { useToolbarState } from "../../context/ToolbarContext";
import { sanitizeUrl } from "../../utils/url";
import {
  clearFormatting,
  formatBulletList,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "../ToolbarPlugin/utils";
import {
  isCenterAlign,
  isClearFormatting,
  isFormatBulletList,
  isFormatHeading,
  isFormatNumberedList,
  isFormatParagraph,
  isFormatQuote,
  isIndent,
  isInsertLink,
  isJustifyAlign,
  isLeftAlign,
  isOutdent,
  isRightAlign,
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
        const { code } = event;
        const headingSize = `h${code[code.length - 1]}` as HeadingTagType;
        formatHeading(editor, toolbarState.blockType, headingSize);
      } else if (isFormatBulletList(event)) {
        event.preventDefault();
        formatBulletList(editor, toolbarState.blockType);
      } else if (isFormatNumberedList(event)) {
        event.preventDefault();
        formatNumberedList(editor, toolbarState.blockType);
      } else if (isFormatQuote(event)) {
        event.preventDefault();
        formatQuote(editor, toolbarState.blockType);
      } else if (isIndent(event)) {
        event.preventDefault();
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      } else if (isOutdent(event)) {
        event.preventDefault();
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      } else if (isCenterAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
      } else if (isLeftAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
      } else if (isRightAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
      } else if (isJustifyAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
      } else if (isClearFormatting(event)) {
        event.preventDefault();
        clearFormatting(editor);
      } else if (isInsertLink(event)) {
        event.preventDefault();
        const url = toolbarState.isLink ? null : sanitizeUrl("https://");
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
