import React, { createContext, useContext, useRef, RefObject, useState } from "react";
import { TreeEnvironmentRef, TreeRef } from "react-complex-tree";

import { TreeDataProviderProps } from "../types";

import { TreeInstance } from "@headless-tree/core";
import { TreeItem } from "react-complex-tree";

export type treeContextType = {
  treeView: RefObject<TreeDataProviderProps | null> | null;
  environment: RefObject<TreeEnvironmentRef | null> | null;
  tree: RefObject<TreeRef | null> | null;
  headlessTree: RefObject<TreeInstance<TreeItem> | null> | null;
  open: boolean;
  togglePanel?: (state: boolean) => void;
};

// Create a context for the tree
const TreeRefContext = createContext<treeContextType | null>(null);

// Create a provider component for the tree ref context
export const TreeRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const treeView = useRef<TreeDataProviderProps | null>(null);
  const environment = useRef<TreeEnvironmentRef | null>(null);
  const tree = useRef<TreeRef | null>(null);
  const headlessTree = useRef<TreeInstance<TreeItem> | null>(null);
  const [open, setOpen] = useState(false);

  const togglePanel = (state: boolean) => {
    setOpen(state);
  };

  return (
    <TreeRefContext.Provider
      value={{
        treeView: treeView,
        environment: environment,
        tree: tree,
        headlessTree: headlessTree,
        open: open,
        togglePanel: togglePanel,
      }}
    >
      {children}
    </TreeRefContext.Provider>
  );
};

// Create a hook to use the tree ref context
export const useTreeRef = () => {
  const context = useContext(TreeRefContext);
  if (context === null) {
    throw new Error("useTreeRef must be used within a TreeRefProvider");
  }
  return context;
};
