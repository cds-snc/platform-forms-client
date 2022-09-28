import React from "react";
import "tippy.js/animations/scale.css";
import "tippy.js/dist/tippy.css";
import { FormatQuote } from "@styled-icons/material/FormatQuote";
import { Looks3 } from "@styled-icons/material/Looks3";
import { Looks4 } from "@styled-icons/material/Looks4";
import { Looks5 } from "@styled-icons/material/Looks5";
import { Looks6 } from "@styled-icons/material/Looks6";
import { LooksTwo } from "@styled-icons/material/LooksTwo";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { FormatStrikethrough } from "@styled-icons/material/FormatStrikethrough";
import { FormatListBulleted } from "@styled-icons/material/FormatListBulleted";
import { FormatListNumbered } from "@styled-icons/material/FormatListNumbered";

import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_UL,
  ELEMENT_OL,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  getPluginType,
  BlockToolbarButton,
  ListToolbarButton,
  MarkToolbarButton,
} from "@udecode/plate";
import { useMyPlateEditorRef } from "./types";

export const BasicElementToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H2)} icon={<LooksTwo />} />
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H3)} icon={<Looks3 />} />
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H4)} icon={<Looks4 />} />
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H5)} icon={<Looks5 />} />
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H6)} icon={<Looks6 />} />
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_BLOCKQUOTE)} icon={<FormatQuote />} />
    </>
  );
};

export const BasicMarkToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton type={getPluginType(editor, MARK_BOLD)} icon={<FormatBold />} />
      <MarkToolbarButton type={getPluginType(editor, MARK_ITALIC)} icon={<FormatItalic />} />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_STRIKETHROUGH)}
        icon={<FormatStrikethrough />}
      />
    </>
  );
};

export const ListToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ListToolbarButton type={getPluginType(editor, ELEMENT_UL)} icon={<FormatListBulleted />} />
      <ListToolbarButton type={getPluginType(editor, ELEMENT_OL)} icon={<FormatListNumbered />} />
    </>
  );
};
