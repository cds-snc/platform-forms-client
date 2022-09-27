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
  createSuperscriptPlugin,
  createSubscriptPlugin,
  createHeadingPlugin,
  HeadingToolbar,
  createBlockquotePlugin,
  createStrikethroughPlugin,
  Plate,
  PlateProvider,
  createExitBreakPlugin,
  LinkToolbarButton,
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
import { Link } from "@styled-icons/material/Link";

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
`;

const plugins = createMyPlugins(
  [
    createParagraphPlugin(),
    createListPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createHeadingPlugin(),
    createStrikethroughPlugin(),
    createBlockquotePlugin(),
    createExitBreakPlugin(exitBreakPluginConfig),
    createSoftBreakPlugin(softBreakPluginConfig),
    createLinkPlugin(linkPluginConfig),
  ],
  {
    components: plateUI,
  }
);

export const RichTextEditor = ({
  value,
  onChange,
}: {
  value: MyRootBlock[];
  onChange: (value: MyValue) => void;
}) => {
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
          <LinkToolbarButton icon={<Link />} />
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
