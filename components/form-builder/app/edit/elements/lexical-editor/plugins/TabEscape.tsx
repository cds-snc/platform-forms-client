import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import { getSelectedNode } from "../utils/getSelectedNode";

export const TabEscape = () => {
  const [editor] = useLexicalComposerContext();
  editor.registerCommand<KeyboardEvent>(
    KEY_TAB_COMMAND,
    (event) => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return false;
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if (parent?.getType() === "listitem") {
        event.preventDefault();
        return editor.dispatchCommand(
          event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
          undefined
        );
      }

      return true;
    },
    COMMAND_PRIORITY_EDITOR
  );
  return null;
};
