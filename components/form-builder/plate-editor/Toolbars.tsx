import React from "react";
import "tippy.js/animations/scale.css";
import "tippy.js/dist/tippy.css";
import { Looks3 } from "@styled-icons/material/Looks3";
import { Looks4 } from "@styled-icons/material/Looks4";
import { Looks5 } from "@styled-icons/material/Looks5";
import { Looks6 } from "@styled-icons/material/Looks6";
import { LooksTwo } from "@styled-icons/material/LooksTwo";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { Link } from "@styled-icons/material/Link";
import { FormatListBulleted } from "@styled-icons/material/FormatListBulleted";
import { FormatListNumbered } from "@styled-icons/material/FormatListNumbered";
import { useTranslation } from "next-i18next";

import {
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_UL,
  ELEMENT_OL,
  MARK_BOLD,
  MARK_ITALIC,
  getPluginType,
  BlockToolbarButton,
  ListToolbarButton,
  MarkToolbarButton,
  LinkToolbarButton,
} from "@udecode/plate";
import { useMyPlateEditorRef } from "./types";

export const BasicElementToolbarButtons = () => {
  const editor = useMyPlateEditorRef();
  const { t } = useTranslation("form-builder");

  return (
    <>
      <BlockToolbarButton
        type={getPluginType(editor, ELEMENT_H2)}
        tooltip={{ content: t("Heading 2") }}
        icon={<LooksTwo />}
      />
      <BlockToolbarButton
        type={getPluginType(editor, ELEMENT_H3)}
        tooltip={{ content: t("Heading 3") }}
        icon={<Looks3 />}
      />
      <BlockToolbarButton
        type={getPluginType(editor, ELEMENT_H4)}
        tooltip={{ content: t("Heading 4") }}
        icon={<Looks4 />}
      />
      <BlockToolbarButton
        type={getPluginType(editor, ELEMENT_H5)}
        tooltip={{ content: t("Heading 5") }}
        icon={<Looks5 />}
      />
      <BlockToolbarButton
        type={getPluginType(editor, ELEMENT_H6)}
        tooltip={{ content: t("Heading 6") }}
        icon={<Looks6 />}
      />
    </>
  );
};

export const BasicMarkToolbarButtons = () => {
  const editor = useMyPlateEditorRef();
  const { t } = useTranslation("form-builder");

  return (
    <>
      <MarkToolbarButton
        type={getPluginType(editor, MARK_BOLD)}
        tooltip={{ content: t("Bold") }}
        icon={<FormatBold />}
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_ITALIC)}
        tooltip={{ content: t("Italics") }}
        icon={<FormatItalic />}
      />
    </>
  );
};

export const ListToolbarButtons = () => {
  const editor = useMyPlateEditorRef();
  const { t } = useTranslation("form-builder");

  return (
    <>
      <ListToolbarButton
        type={getPluginType(editor, ELEMENT_UL)}
        tooltip={{ content: t("Unordered list") }}
        icon={<FormatListBulleted />}
      />
      <ListToolbarButton
        type={getPluginType(editor, ELEMENT_OL)}
        tooltip={{ content: t("Ordered list") }}
        icon={<FormatListNumbered />}
      />
    </>
  );
};

export const LinkToolbarButtons = () => {
  const editor = useMyPlateEditorRef()!;

  return (
    <>
      <LinkToolbarButton id={editor?.id} tooltip={{ content: "Link" }} icon={<Link />} />
    </>
  );
};
