/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from "react";

import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

export const MIN_ALLOWED_FONT_SIZE = 8;
export const MAX_ALLOWED_FONT_SIZE = 72;
export const DEFAULT_FONT_SIZE = 15;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

export const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  h2: "Heading 2",
  h3: "Heading 3",
  number: "Numbered List",
  paragraph: "Normal",
};

const INITIAL_TOOLBAR_STATE = {
  blockType: "paragraph" as keyof typeof blockTypeToBlockName,
  canRedo: false,
  canUndo: false,
  isBold: false,
  isItalic: false,
  isLink: false,
  isIndent: false,
  isOutdent: false,
  rootType: "root" as keyof typeof rootTypeToRootName,
};

type ToolbarState = typeof INITIAL_TOOLBAR_STATE;

// Utility type to get keys and infer value types
type ToolbarStateKey = keyof ToolbarState;
type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

type ContextShape = {
  toolbarState: ToolbarState;
  updateToolbarState<Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>): void;
};

const Context = createContext<ContextShape | undefined>(undefined);

export const ToolbarContext = ({ children }: { children: ReactNode }): JSX.Element => {
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);

  const updateToolbarState = useCallback(
    <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
      setToolbarState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const contextValue = useMemo(() => {
    return {
      toolbarState,
      updateToolbarState,
    };
  }, [toolbarState, updateToolbarState]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useToolbarState = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useToolbarState must be used within a ToolbarProvider");
  }

  return context;
};
