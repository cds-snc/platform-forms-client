import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";
import { Responses } from "@lib/types";

interface ProgressType {
  userProgress?: Responses | undefined;
  importProgress: Dispatch<SetStateAction<Responses | undefined>>;
}

export const ProgressContext = createContext<ProgressType | null>(null);

export function ProgressProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: Record<string, string> | undefined;
}) {
  const [userProgress, importProgress] = useState<Responses | undefined>(data);

  return (
    <ProgressContext.Provider value={{ userProgress, importProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const value = useContext(ProgressContext);
  if (value === null) throw new Error("Provider missing");
  return value;
};
