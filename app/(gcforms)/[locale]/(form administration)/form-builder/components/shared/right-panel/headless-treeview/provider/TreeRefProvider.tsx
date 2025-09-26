import React, { createContext, useContext, useRef, RefObject, useState } from "react";
import { HeadlessTreeHandleProps } from "../types";

import { TreeInstance } from "@headless-tree/core";
import { TreeItem } from "react-complex-tree";

export type treeContextType = {
  headlessTreeHandle: RefObject<HeadlessTreeHandleProps | null> | null;
  headlessTree: RefObject<TreeInstance<TreeItem> | null> | null;
  open: boolean;
  togglePanel?: (state: boolean) => void;
  startRenamingNewGroup?: (id: string) => void;
};

// Create a context for the tree
const TreeRefContext = createContext<treeContextType | null>(null);

// Create a provider component for the tree ref context
export const TreeRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const treeView = useRef<HeadlessTreeHandleProps | null>(null);
  const headlessTree = useRef<TreeInstance<TreeItem> | null>(null);
  const [open, setOpen] = useState(false);

  const togglePanel = (state: boolean) => {
    setOpen(state);
  };

  const startRenamingNewGroup = (id: string) => {
    headlessTree.current?.rebuildTree();
    headlessTree.current?.setSelectedItems([id]);

    const newItem = headlessTree.current?.getItemInstance(id);

    if (newItem) {
      // Ensure the item is focused
      // If not onFocus (setActiveGroup) will `reset` the active group
      if (typeof newItem.setFocused === "function") {
        newItem.setFocused();
      }

      // Start renaming the newly created item
      if (typeof newItem.startRenaming === "function") {
        newItem.startRenaming();
      }
    }
  };

  return (
    <TreeRefContext.Provider
      value={{
        headlessTreeHandle: treeView,
        headlessTree: headlessTree,
        open: open,
        togglePanel: togglePanel,
        startRenamingNewGroup: startRenamingNewGroup,
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
