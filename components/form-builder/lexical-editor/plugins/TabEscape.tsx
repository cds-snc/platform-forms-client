import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_HIGH, KEY_TAB_COMMAND } from "lexical";

export const TabEscape = () => {
  const [editor] = useLexicalComposerContext();
  editor.registerCommand<KeyboardEvent>(
    KEY_TAB_COMMAND,
    () => {
      return true;
    },
    COMMAND_PRIORITY_HIGH
  );
  return null;
};
