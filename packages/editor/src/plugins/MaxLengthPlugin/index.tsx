/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $trimTextContentFromAnchor } from "@lexical/selection";
import { $restoreEditorState } from "@lexical/utils";
import { $getSelection, $isRangeSelection, EditorState, RootNode } from "lexical";
import { JSX, useEffect, useState } from "react";
import "./styles.css";

const MaxLengthIndicator = ({
  maxLength,
  contentLength,
}: {
  maxLength?: number;
  contentLength: number;
}) => {
  if (!maxLength) {
    return null;
  }

  return (
    // Only show if contentLength reaches 80% of maxLength
    contentLength >= 0.8 * maxLength && (
      <div className="gc-editor-max-length">
        {contentLength}/{maxLength}
      </div>
    )
  );
};

export function MaxLengthPlugin({ maxLength }: { maxLength: number }): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [contentLength, setContentLength] = useState(0);

  useEffect(() => {
    let lastRestoredEditorState: EditorState | null = null;

    return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return;
      }
      const prevEditorState = editor.getEditorState();
      const prevTextContentSize = prevEditorState.read(() => rootNode.getTextContentSize());
      const textContentSize = rootNode.getTextContentSize();
      setContentLength(textContentSize);

      if (prevTextContentSize !== textContentSize) {
        const delCount = textContentSize - maxLength;
        const anchor = selection.anchor;

        if (delCount > 0) {
          // Restore the old editor state instead if the last
          // text content was already at the limit.
          if (prevTextContentSize === maxLength && lastRestoredEditorState !== prevEditorState) {
            lastRestoredEditorState = prevEditorState;
            $restoreEditorState(editor, prevEditorState);
          } else {
            $trimTextContentFromAnchor(editor, anchor, delCount);
          }
        }
      }
    });
  }, [editor, maxLength, setContentLength]);

  return <MaxLengthIndicator contentLength={contentLength} maxLength={maxLength} />;
}
