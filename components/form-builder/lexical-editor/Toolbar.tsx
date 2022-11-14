import React, { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { mergeRegister, $getNearestNodeOfType } from "@lexical/utils";
import { Looks3 } from "@styled-icons/material/Looks3";
import { LooksTwo } from "@styled-icons/material/LooksTwo";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { Link } from "@styled-icons/material/Link";
import { FormatListBulleted } from "@styled-icons/material/FormatListBulleted";
import { FormatListNumbered } from "@styled-icons/material/FormatListNumbered";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useRichTextToolbarTranslations } from "../hooks/useRichTextToolbarTranslations";

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
} from "@lexical/list";

import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from "lexical";

import { $wrapNodes } from "@lexical/selection";
import styled from "styled-components";
import { sanitizeUrl } from "./utils/sanitizeUrl";
import { t } from "i18next";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const ToolbarContainer = styled.div`
  border-bottom: 1px solid #ddd;
  background-color: #f7f7f7;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 10px;

  &:focus-within {
    margin: -2px;
    border: 2px solid #015ecc;
  }

  button {
    padding: 4px;
    border: 1.5px solid transparent;
    border-radius: 4px;
    margin-right: 5px;
    svg {
      display: block;
    }
    &.active {
      border: 1.5px solid #015ecc;
    }
  }
`;

const LowPriority = 1;
type HeadingTagType = "h2" | "h3" | "h4" | "h5";

export const Toolbar = ({ editorId }: { editorId: string }) => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isLink] = useState(false);
  const [, setSelectedElementKey] = useState("");
  const [blockType, setBlockType] = useState("paragraph");

  const [isEditable] = useState(() => editor.isEditable());

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const [items] = useState([
    { id: 1, txt: "heading2" },
    { id: 2, txt: "heading3" },
    { id: 3, txt: "bold" },
    { id: 4, txt: "italic" },
    { id: 5, txt: "bulletedList" },
    { id: 6, txt: "numberedList" },
    { id: 7, txt: "link" },
  ]);

  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [toolbarInit, setToolbarInit] = useState(false);

  useEffect(() => {
    const index = `button-${currentFocusIndex}` as unknown as number;
    const el = itemsRef.current[index];
    if (el) {
      el.focus();
    }
  }, [currentFocusIndex]);

  const handleNav = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      const { key } = evt;

      if (!toolbarInit) {
        setCurrentFocusIndex(0);
        setToolbarInit(true);
      }

      if (key === "ArrowLeft") {
        evt.preventDefault();
        setCurrentFocusIndex((index) => Math.max(0, index - 1));
      } else if (key === "ArrowRight") {
        evt.preventDefault();
        setCurrentFocusIndex((index) => Math.min(items.length - 1, index + 1));
      }
    },
    [items, setCurrentFocusIndex, setToolbarInit, toolbarInit]
  );

  const formatHeading = (level: HeadingTagType) => {
    if (blockType === level) {
      formatParagraph();
    }

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

  const formatBulletList = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const formatNumberedList = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
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
      setIsItalic(selection.hasFormat("italic"));

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
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

  const translations = useRichTextToolbarTranslations();

  return (
    <>
      <ToolbarContainer
        role="toolbar"
        aria-label={translations.textFormatting}
        aria-controls={editorId}
        onKeyDown={handleNav}
      >
        <button
          tabIndex={0}
          ref={(el) => {
            const index = "button-0" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          onClick={() => {
            formatHeading("h2");
          }}
          className={"toolbar-item spaced " + (blockType === "h2" ? "active" : "")}
          aria-label={translations.heading2}
        >
          <LooksTwo size={20} />
        </button>

        <button
          tabIndex={currentFocusIndex == 1 ? 0 : -1}
          ref={(el) => {
            const index = "button-1" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          onClick={() => {
            formatHeading("h3");
          }}
          className={"toolbar-item spaced " + (blockType === "h3" ? "active" : "")}
          aria-label={translations.heading3}
        >
          <Looks3 size={20} />
        </button>

        <button
          tabIndex={currentFocusIndex == 2 ? 0 : -1}
          ref={(el) => {
            const index = "button-2" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={"toolbar-item " + (isBold ? "active" : "")}
          aria-label={translations.bold}
        >
          <FormatBold size={20} />
        </button>

        <button
          tabIndex={currentFocusIndex == 3 ? 0 : -1}
          ref={(el) => {
            const index = "button-3" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={"toolbar-item " + (isItalic ? "active" : "")}
          aria-label={translations.italic}
        >
          <FormatItalic size={20} />
        </button>

        <button
          tabIndex={currentFocusIndex == 4 ? 0 : -1}
          ref={(el) => {
            const index = "button-4" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          onClick={formatBulletList}
          className={"toolbar-item " + (blockType === "bullet" ? "active" : "")}
          aria-label={translations.bulletList}
        >
          <FormatListBulleted size={20} />
        </button>

        <button
          tabIndex={currentFocusIndex == 5 ? 0 : -1}
          ref={(el) => {
            const index = "button-5" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          onClick={formatNumberedList}
          className={"toolbar-item " + (blockType === "number" ? "active" : "")}
          aria-label={translations.numberList}
        >
          <FormatListNumbered size={20} />
        </button>

        <button
          tabIndex={currentFocusIndex == 6 ? 0 : -1}
          ref={(el) => {
            const index = "button-6" as unknown as number;
            if (el && itemsRef.current) {
              itemsRef.current[index] = el;
            }
          }}
          disabled={!isEditable}
          onClick={insertLink}
          className={"toolbar-item " + (isLink ? "active" : "")}
          aria-label={translations.link}
        >
          <Link size={20} />
        </button>
      </ToolbarContainer>
    </>
  );
};
