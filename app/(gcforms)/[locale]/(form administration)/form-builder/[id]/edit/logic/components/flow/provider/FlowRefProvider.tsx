import React, { createContext, useContext, useRef, MutableRefObject } from "react";

export type flowContextType = {
  flow: MutableRefObject<any>;
} | null;

// Create a context for the ref
const FlowRefContext = createContext<flowContextType>(null);

// Create a provider component for the ref context
export const FlowRefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const flow = useRef(null);
  return (
    <FlowRefContext.Provider
      value={{
        flow: flow
      }}
    >
      {children}
    </FlowRefContext.Provider>
  );
};

// Create a hook to use the tree ref context
export const useFlowRef = () => {
  const context = useContext(FlowRefContext);
  if (context === null) {
    throw new Error("useFlowRef must be used within a FlowRefProvider");
  }
  return context;
};
