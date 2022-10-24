import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export const FocusPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, []);

  return null;
};

export default FocusPlugin;
