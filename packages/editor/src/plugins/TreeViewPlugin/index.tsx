/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";
import * as React from "react";

import type { JSX } from "react";
import "./styles.css";

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="gc-editor-treeview">
      <TreeView
        viewClassName="tree-view-output"
        timeTravelPanelClassName="debug-timetravel-panel"
        timeTravelButtonClassName="debug-timetravel-button"
        timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
        timeTravelPanelButtonClassName="debug-timetravel-panel-button"
        treeTypeButtonClassName=""
        editor={editor}
      />
    </div>
  );
}
