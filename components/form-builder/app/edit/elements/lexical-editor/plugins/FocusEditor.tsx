import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export const FocusPlugin = ({ autoFocusEditor = false }: { autoFocusEditor?: boolean }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (autoFocusEditor) {
      editor.focus();
    }
  }, [autoFocusEditor, editor]);

  return null;
};

export default FocusPlugin;
