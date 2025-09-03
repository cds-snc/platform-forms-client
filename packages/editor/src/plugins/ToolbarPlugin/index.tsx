"use client";
import React, { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { $isHeadingNode } from "@lexical/rich-text";
import { mergeRegister, $getNearestNodeOfType, $findMatchingParent } from "@lexical/utils";

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";

import { $isListNode, ListNode } from "@lexical/list";

import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from "lexical";

import { useEditorFocus } from "../../hooks/useEditorFocus";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { ToolTip } from "../../ui/ToolTip";
import { H2Icon } from "../../icons/H2Icon";
import { H3Icon } from "../../icons/H3Icon";
import { BoldIcon } from "../../icons/BoldIcon";
import { ItalicIcon } from "../../icons/ItalicIcon";
import { BulletListIcon } from "../../icons/BulletListIcon";
import { NumberedListIcon } from "../../icons/NumberedListIcon";
import { LinkIcon } from "../../icons/LinkIcon";
import { useTranslation } from "../../hooks/useTranslation";
import {
  formatBulletList,
  formatHeading,
  formatIndent,
  formatNumberedList,
  formatOutdent,
} from "./utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import "./styles.css";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { blockTypeToBlockName, useToolbarState } from "../../context/ToolbarContext";
import { IndentIcon } from "../../icons/IndentIcon";
import { OutdentIcon } from "../../icons/OutdentIcon";

export default function ToolbarPlugin({
  editorId,
  setIsLinkEditMode,
}: {
  editorId: string;
  setIsLinkEditMode: (isLinkEditMode: boolean) => void;
}) {
  const [editor] = useLexicalComposerContext();

  const { toolbarState, updateToolbarState } = useToolbarState();
  const [, setSelectedElementKey] = useState("");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [activeEditor, setActiveEditor] = useState(editor);

  const { t } = useTranslation();

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, "");
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);

  const [items] = useState([
    { id: 1, txt: "heading2" },
    { id: 2, txt: "heading3" },
    { id: 3, txt: "bold" },
    { id: 4, txt: "italic" },
    { id: 5, txt: "bulletedList" },
    { id: 6, txt: "numberedList" },
    { id: 7, txt: "link" },
    { id: 8, txt: "indent" },
    { id: 9, txt: "outdent" },
  ]);

  const itemsRef = useRef<[HTMLButtonElement] | []>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [toolbarInit, setToolbarInit] = useState(false);

  useEffect(() => {
    const index = `button-${currentFocusIndex}` as unknown as number;
    const el = itemsRef.current[index];
    if (el && toolbarInit) {
      el.focus();
    }
  }, [currentFocusIndex, toolbarInit]);

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

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState("isLink", isLink);

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();

          updateToolbarState("blockType", type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState("blockType", type as keyof typeof blockTypeToBlockName);
          }
        }
      }
    }
    if ($isRangeSelection(selection)) {
      // Update text format
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
    }
  }, [editor, updateToolbarState]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  const editorHasFocus = useEditorFocus();

  return (
    <>
      <div
        className="gc-toolbar-container"
        role="toolbar"
        aria-label={t("textFormatting")}
        aria-controls={editorId}
        onKeyDown={handleNav}
        data-testid="toolbar"
      >
        <ToolTip text={t("tooltipFormatH2") + ` (${SHORTCUTS.HEADING2})`}>
          <button
            tabIndex={currentFocusIndex == 0 ? 0 : -1}
            ref={(el) => {
              const index = "button-0" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            onClick={() => {
              formatHeading(editor, toolbarState.blockType, "h2");
            }}
            className={
              "toolbar-item " + (toolbarState.blockType === "h2" && editorHasFocus ? "active" : "")
            }
            aria-label={t("formatH2")}
            aria-pressed={toolbarState.blockType === "h2"}
            data-testid={`h2-button`}
          >
            <H2Icon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipFormatH3") + ` (${SHORTCUTS.HEADING3})`}>
          <button
            tabIndex={currentFocusIndex == 1 ? 0 : -1}
            ref={(el) => {
              const index = "button-1" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            onClick={() => {
              formatHeading(editor, toolbarState.blockType, "h3");
            }}
            className={
              "toolbar-item " + (toolbarState.blockType === "h3" && editorHasFocus ? "active" : "")
            }
            aria-label={t("formatH3")}
            aria-pressed={toolbarState.blockType === "h3"}
            data-testid={`h3-button`}
          >
            <H3Icon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipFormatBold") + ` (${SHORTCUTS.BOLD})`}>
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
            className={"toolbar-item " + (toolbarState.isBold && editorHasFocus ? "active" : "")}
            aria-label={t("formatBold")}
            aria-pressed={toolbarState.isBold}
            data-testid={`bold-button`}
          >
            <BoldIcon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipFormatItalic") + ` (${SHORTCUTS.ITALIC})`}>
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
            className={"toolbar-item " + (toolbarState.isItalic && editorHasFocus ? "active" : "")}
            aria-label={t("formatItalic")}
            aria-pressed={toolbarState.isItalic}
            data-testid={`italic-button`}
          >
            <ItalicIcon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipFormatBulletList") + ` (${SHORTCUTS.BULLET_LIST})`}>
          <button
            tabIndex={currentFocusIndex == 4 ? 0 : -1}
            ref={(el) => {
              const index = "button-4" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            onClick={() => formatBulletList(editor, toolbarState.blockType)}
            className={
              "toolbar-item " +
              (toolbarState.blockType === "bullet" && editorHasFocus ? "active" : "")
            }
            aria-label={t("formatBulletList")}
            aria-pressed={toolbarState.blockType === "bullet"}
            data-testid={`bullet-list-button`}
          >
            <BulletListIcon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipFormatNumberedList") + ` (${SHORTCUTS.NUMBERED_LIST})`}>
          <button
            tabIndex={currentFocusIndex == 5 ? 0 : -1}
            ref={(el) => {
              const index = "button-5" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            onClick={() => formatNumberedList(editor, toolbarState.blockType)}
            className={
              "toolbar-item " +
              (toolbarState.blockType === "number" && editorHasFocus ? "active" : "")
            }
            aria-label={t("formatNumberedList")}
            aria-pressed={toolbarState.blockType === "number"}
            data-testid={`numbered-list-button`}
          >
            <NumberedListIcon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipInsertLink") + ` (${SHORTCUTS.INSERT_LINK})`}>
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
            className={"toolbar-item " + (toolbarState.isLink && editorHasFocus ? "active" : "")}
            aria-label={t("insertLink")}
            aria-pressed={toolbarState.isLink}
            data-testid={`link-button`}
          >
            <LinkIcon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipIndent") + ` (${SHORTCUTS.INDENT})`}>
          <button
            tabIndex={currentFocusIndex == 7 ? 0 : -1}
            ref={(el) => {
              const index = "button-7" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            onClick={() => formatIndent(editor)}
            className="toolbar-item"
            aria-label={t("indent")}
            data-testid="indent-button"
          >
            <IndentIcon />
          </button>
        </ToolTip>

        <ToolTip text={t("tooltipOutdent") + ` (${SHORTCUTS.OUTDENT})`}>
          <button
            tabIndex={currentFocusIndex == 8 ? 0 : -1}
            ref={(el) => {
              const index = "button-8" as unknown as number;
              if (el && itemsRef.current) {
                itemsRef.current[index] = el;
              }
            }}
            onClick={() => formatOutdent(editor)}
            className="toolbar-item"
            aria-label={t("outdent")}
            data-testid="outdent-button"
          >
            <OutdentIcon />
          </button>
        </ToolTip>
      </div>
    </>
  );
}
