import React from "react";
import { editableProps } from "./editableProps";
import { createMyPlugins, MyRootBlock, MyValue } from "./types";
import { plateUI } from "./plateUI";
import PropTypes from "prop-types";

import {
  createLinkPlugin,
  createParagraphPlugin,
  createListPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createHeadingPlugin,
  HeadingToolbar,
  Plate,
  PlateProvider,
  createExitBreakPlugin,
  Value,
} from "@udecode/plate";

import { exitBreakPluginConfig } from "./plugins/exitBreakPluginConfig";

import styled from "styled-components";
import {
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  ListToolbarButtons,
} from "./Toolbars";
import { linkPluginConfig } from "./plugins/linkPluginConfig";
import { softBreakPluginConfig } from "./plugins/softBreakPluginConfig";
import { createSoftBreakPlugin } from "./plugins/soft-break";

const RichTextWrapper = styled.div`
  [data-slate-editor] {
    padding: 10px 5px;
  }

  .slate-ToolbarButton {
    svg {
      height: 24px;
      width: 24px;
    }
  }

  .slate-HeadingToolbar {
    background: white;
    border-bottom: 1px solid #ddd;
    z-index: 1000;
    padding-bottom: 0;
  }

  span[data-slate-placeholder="true"] {
    color: #71767e;
    opacity: 1 !important;
  }
`;

const plugins = createMyPlugins(
  [
    createParagraphPlugin(),
    createListPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createHeadingPlugin(),
    createExitBreakPlugin(exitBreakPluginConfig),
    createSoftBreakPlugin(softBreakPluginConfig),
    createLinkPlugin(linkPluginConfig),
  ],
  {
    components: plateUI,
  }
);

export const RichTextEditor = ({
  id,
  value,
  onChange,
  "aria-label": ariaLabel = undefined,
}: {
  id: string;
  value: MyRootBlock[];
  onChange: (value: Value) => void;
  "aria-label"?: string;
}) => {
  return (
    <RichTextWrapper style={{ width: "100%" }}>
      <PlateProvider<MyValue> id={id} plugins={plugins} initialValue={value} onChange={onChange}>
        <HeadingToolbar>
          <BasicElementToolbarButtons />
          <BasicMarkToolbarButtons />
          <ListToolbarButtons />
          {/* <LinkToolbarButtons /> */}
        </HeadingToolbar>
        <Plate<MyValue>
          id={id}
          editableProps={
            ariaLabel ? { ...editableProps, ...{ "aria-label": ariaLabel } } : editableProps
          }
          plugins={plugins}
          initialValue={value}
          onChange={onChange}
        />
      </PlateProvider>
    </RichTextWrapper>
  );
};

RichTextEditor.propTypes = {
  id: PropTypes.string,
  value: PropTypes.array,
  onChange: PropTypes.func,
};
