import React, { createContext, useContext, useRef } from "react";
import { TreeApi } from "react-arborist";
import { TreeItem } from "../types";

export type treeRefType = TreeApi<TreeItem> | undefined;

// Create a context for the tree ref
const TreeRefContext = createContext<React.MutableRefObject<TreeApi<TreeItem> | undefined> | null>(
  null
);

// Create a provider component for the tree ref context
export const TreeRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const treeRef = useRef<treeRefType>();
  return <TreeRefContext.Provider value={treeRef}>{children}</TreeRefContext.Provider>;
};

// Create a hook to use the tree ref context
export const useTreeRef = () => {
  const context = useContext(TreeRefContext);
  if (context === null) {
    throw new Error("useTreeRef must be used within a TreeRefProvider");
  }
  return context;
};
