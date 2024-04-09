import React, { createContext, useContext, useRef, RefObject } from "react";
import { TreeEnvironmentRef, TreeRef } from "react-complex-tree";
import { TreeDataProviderProps } from "../types";

export type treeContextType = {
  treeView: RefObject<TreeDataProviderProps> | null;
  environment: RefObject<TreeEnvironmentRef> | null;
  tree: RefObject<TreeRef> | null;
};

// Create a context for the tree
const TreeRefContext = createContext<treeContextType | null>(null);

// Create a provider component for the tree ref context
export const TreeRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const treeView = useRef<TreeDataProviderProps>(null);
  const environment = useRef<TreeEnvironmentRef>(null);
  const tree = useRef<TreeRef>(null);
  return (
    <TreeRefContext.Provider
      value={{
        treeView: treeView,
        environment: environment,
        tree: tree,
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
