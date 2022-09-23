import React from "react";
import { editableProps } from "./editableProps";
import { createMyPlugins, MyValue } from "./types";
import { plateUI } from "./plateUI";
import PropTypes from "prop-types";

import {
  createLinkPlugin,
  createParagraphPlugin,
  createListPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createSuperscriptPlugin,
  createSubscriptPlugin,
  createHeadingPlugin,
  HeadingToolbar,
  createBlockquotePlugin,
  createStrikethroughPlugin,
  Plate,
  PlateProvider,
  createExitBreakPlugin,
} from "@udecode/plate";

import { exitBreakPlugin } from "./plugins/exitBreakPlugin";

import styled from "styled-components";
import {
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  ListToolbarButtons,
} from "./Toolbars";
import { linkPlugin } from "./plugins/linkPlugin";

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
  }
`;

const plugins = createMyPlugins<MyValue>(
  [
    createLinkPlugin(linkPlugin), // no toolbar item
    createParagraphPlugin(),
    createListPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createHeadingPlugin(),
    createStrikethroughPlugin(),
    createBlockquotePlugin(),
    createExitBreakPlugin(exitBreakPlugin), // not working?
  ],
  {
    components: plateUI,
  }
);

export const RichTextEditor = ({ value, onChange }) => {
  return (
    <RichTextWrapper>
      <PlateProvider<MyValue>
        plugins={plugins}
        initialValue={value}
        onChange={(value) => {
          onChange(value);
        }}
      >
        <HeadingToolbar>
          <BasicElementToolbarButtons />
          <BasicMarkToolbarButtons />
          <ListToolbarButtons />
        </HeadingToolbar>
        <Plate<MyValue> editableProps={editableProps} />
      </PlateProvider>
    </RichTextWrapper>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
};
