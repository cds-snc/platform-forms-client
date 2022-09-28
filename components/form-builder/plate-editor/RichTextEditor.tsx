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
  id,
  value,
  onChange,
}: {
  id: string;
  value: MyRootBlock[];
  onChange: (value: MyValue) => void;
}) => {
  return (
    <RichTextWrapper style={{ width: "100%" }}>
      <PlateProvider<MyValue>
        id={id}
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
          {/* <LinkToolbarButton tooltip={{ content: "Huzzah" }} id={id} icon={<Link />} /> */}
        </HeadingToolbar>
        <Plate<MyValue>
          id={id}
          editableProps={editableProps}
          plugins={plugins}
          initialValue={value}
          onChange={(value) => {
            onChange(value);
          }}
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
