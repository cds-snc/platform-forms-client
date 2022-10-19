import React, { useState, useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $isHeadingNode,
    $createHeadingNode
} from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import {
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
    SELECTION_CHANGE_COMMAND,
    $createParagraphNode
} from "lexical";

import { $wrapNodes } from "@lexical/selection";

const LowPriority = 1;
type HeadingTagType = 'h2' | 'h3' | 'h4' | 'h5';

export const Toolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [, setSelectedElementKey] = useState("");
    const [blockType, setBlockType] = useState("paragraph");
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
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);
            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);

                const type = $isHeadingNode(element)
                    ? element.getTag()
                    : element.getType();
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
                (_payload, newEditor) => {
                    updateToolbar();
                    return false;
                },
                LowPriority
            ),

        );
    }, [editor, updateToolbar]);

    return (
        <>
            <button
                style={{ marginRight: 10 }}
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
                className={"toolbar-item " + (isBold ? "active" : "")}
                aria-label="Format Bold"
            >
                Bold
            </button>



            <button
                style={{ marginRight: 10 }}
                onClick={() => {
                    formatParagraph()
                }}
                className={"toolbar-item spaced " + (isBold ? "active" : "")}
                aria-label="Normal"
            >

                Paragraph
            </button>

            <button
                style={{ marginRight: 10 }}
                onClick={() => {
                    formatHeading("h2")
                }}
                className={"toolbar-item spaced " + (isBold ? "active" : "")}
                aria-label="Format H2"
            >
                H2
            </button>
        </>
    )
}