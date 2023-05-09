import React, { createContext, useContext, useRef, RefObject } from "react";

interface RefsContextType {
  refs?: RefObject<HTMLTextAreaElement[]> | undefined;
}

const RefsContext = createContext<RefsContextType>({});

export function RefsProvider({ children }: { children: React.ReactNode }) {
  const refs = useRef<HTMLTextAreaElement[]>([]);

  return <RefsContext.Provider value={{ refs }}>{children}</RefsContext.Provider>;
}

export const useRefsContext = () => useContext(RefsContext);
