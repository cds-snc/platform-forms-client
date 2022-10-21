import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { LinkEditor } from "./plugins/LinkEditor";
import { Looks3 } from "@styled-icons/material/Looks3";
import { LooksTwo } from "@styled-icons/material/LooksTwo";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { Link } from "@styled-icons/material/Link";
import { FormatListBulleted } from "@styled-icons/material/FormatListBulleted";
import { FormatListNumbered } from "@styled-icons/material/FormatListNumbered";
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from "lexical";

import { $wrapNodes } from "@lexical/selection";
import styled from "styled-components";

const ToolbarContainer = styled.div`
  border-bottom: 1px solid #ddd;
  padding: 0 20px 10px 20px;
`;

const LowPriority = 1;
type HeadingTagType = "h2" | "h3" | "h4" | "h5";

export const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [, setSelectedElementKey] = useState("");
  const [blockType, setBlockType] = useState("paragraph");

  const [items] = useState([
    { id: 1, txt: "heading2" },
    { id: 2, txt: "heading3" },
    { id: 3, txt: "bold" },
    { id: 4, txt: "italic" },
    { id: 5, txt: "bulletedList" },
    { id: 6, txt: "numberedList" },
    { id: 7, txt: "link" },
  ]);

  const itemsContainerRef = useRef(null);
  const itemsRef = useRef([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [currentActiveId, setCurrentActiveId] = useState(-1);

  useEffect(() => {
    const el = itemsRef.current[`row-${currentFocusIndex}`];
    if (el) {
      el.focus();
      setCurrentActiveId(el.id);
    }
  }, [currentFocusIndex]);

  const handleNav = useCallback(
    (evt) => {
      const { key } = evt;
      if (key === "ArrowLeft") {
        evt.preventDefault();
        setCurrentFocusIndex((index) => Math.max(0, index - 1));
      } else if (key === "ArrowRight") {
        evt.preventDefault();
        setCurrentFocusIndex((index) => Math.min(items.length - 1, index + 1));
      }
    },
    [items]
  );

  const formatHeading = (level: HeadingTagType) => {
    if (blockType !== level) {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode(level));
        }
      });
    }
  };

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);

        const type = $isHeadingNode(element) ? element.getTag() : element.getType();
        setBlockType(type);
      }

      // Update text format
      setIsBold(selection.hasFormat("bold"));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  // @TODO: aria-controls below needs an id for the editor
  return (
    <>
      <ToolbarContainer
        role="toolbar"
        aria-label="Text formatting"
        aria-controls=""
        onKeyDown={handleNav}
      >
        <button
          tabIndex={0}
          ref={(el) => (itemsRef.current["row-0"] = el)}
          style={{ marginRight: 10 }}
          onClick={() => {
            formatHeading("h2");
          }}
          className={"toolbar-item spaced " + (isBold ? "active" : "")}
          aria-label="Format H2"
        >
          <LooksTwo size={20} />
        </button>

        <button
          tabIndex={-1}
          ref={(el) => (itemsRef.current["row-1"] = el)}
          style={{ marginRight: 10 }}
          onClick={() => {
            formatHeading("h3");
          }}
          className={"toolbar-item spaced " + (isBold ? "active" : "")}
          aria-label="Format H3"
        >
          <Looks3 size={20} />
        </button>

        <button
          tabIndex={-1}
          ref={(el) => (itemsRef.current["row-2"] = el)}
          style={{ marginRight: 10 }}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={"toolbar-item " + (isBold ? "active" : "")}
          aria-label="Format Bold"
        >
          <FormatBold size={20} />
        </button>

        <button
          tabIndex={-1}
          ref={(el) => (itemsRef.current["row-3"] = el)}
          style={{ marginRight: 10 }}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={"toolbar-item " + (isBold ? "active" : "")}
          aria-label="Format Italic"
        >
          <FormatItalic size={20} />
        </button>

        <button
          tabIndex={-1}
          ref={(el) => (itemsRef.current["row-4"] = el)}
          style={{ marginRight: 10 }}
          className={"toolbar-item " + (isBold ? "active" : "")}
          aria-label="Format list bulleted"
        >
          <FormatListBulleted size={20} />
        </button>

        <button
          tabIndex={-1}
          ref={(el) => (itemsRef.current["row-5"] = el)}
          style={{ marginRight: 10 }}
          className={"toolbar-item " + (isBold ? "active" : "")}
          aria-label="Format list numbered"
        >
          <FormatListNumbered size={20} />
        </button>

        <LinkEditor>
          <button
            tabIndex={-1}
            ref={(el) => (itemsRef.current["row-6"] = el)}
            style={{ marginRight: 10 }}
            className={"toolbar-item " + (isBold ? "active" : "")}
            aria-label="Format Link"
          >
            <Link size={20} />
          </button>
        </LinkEditor>
      </ToolbarContainer>
    </>
  );
};
