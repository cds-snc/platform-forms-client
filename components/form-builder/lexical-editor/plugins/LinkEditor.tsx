import React from "react";
import PropTypes from "prop-types";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  $getSelection,
  $isRangeSelection,
  GridSelection,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isAtNodeEnd } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";

const LowPriority = 1;

function positionEditorElement(linkEditor: HTMLElement, rect: DOMRectReadOnly | null) {
  if (rect === null) {
    linkEditor.style.opacity = "0";
    linkEditor.style.top = "-1000px";
    linkEditor.style.left = "-1000px";
  } else {
    const top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    const left = `${rect.left}px`;
    linkEditor.style.opacity = "1";
    linkEditor.style.top = top;
    linkEditor.style.left = left;
  }
}

type Selection = RangeSelection | NodeSelection | GridSelection;

export const FloatingLinkEditor = ({
  editor,
  toggleEditor,
}: {
  editor: LexicalEditor;
  toggleEditor: (state: boolean) => void;
}) => {
  const linkEditorRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [lastSelection, setLastSelection] = useState<Selection | null>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }

    const linkEditorElem = linkEditorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (linkEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner: Element = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(linkEditorElem, rect);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(linkEditorElem, null);
      setLastSelection(null);
      setLinkUrl("");
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  const input = (
    <input
      ref={inputRef}
      className="link-input"
      value={linkUrl}
      onChange={(event) => {
        setLinkUrl(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          if (lastSelection !== null) {
            if (linkUrl !== "") {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
              toggleEditor(false);
            }
          }
        } else if (event.key === "Escape") {
          event.preventDefault();
        }
      }}
    />
  );

  return (
    <div
      ref={linkEditorRef}
      style={{ position: "absolute", width: "500px" }}
      className="link-editor"
    >
      {input}
    </div>
  );
};

FloatingLinkEditor.propTypes = {
  editor: PropTypes.object,
};

function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

export const LinkEditor = ({ children }: { children: JSX.Element }) => {
  const [editor] = useLexicalComposerContext();
  const [, setBlockType] = useState("paragraph");
  const [, setSelectedElementKey] = useState<string | null>(null);
  const [isLink, setIsLink] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const toggleEditor = useCallback(
    (state: boolean) => {
      setShowEditor(state);
    },
    [setShowEditor]
  );

  const updateLink = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLink();
        });
      })
    );
  }, [editor, updateLink]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      toggleEditor(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      toggleEditor(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const activeClass = `${isLink ? "active" : ""}`;
  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          className: `${child.props.className} ${activeClass}`,
          onClick: child.props.onClick || insertLink,
        })
      )}
      {isLink &&
        showEditor &&
        createPortal(
          <FloatingLinkEditor toggleEditor={toggleEditor} editor={editor} />,
          document.body
        )}
    </>
  );
};
