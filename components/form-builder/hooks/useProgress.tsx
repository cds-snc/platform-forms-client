import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface ProgressType {
  userProgress?: Record<string, string> | undefined;
  saveProgress?: Dispatch<SetStateAction<Record<string, string> | undefined>>;
}

export const ProgressContext = createContext<ProgressType | null>(null);

export function ProgressProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: Record<string, string> | undefined;
}) {
  const [userProgress, saveProgress] = useState<Record<string, string> | undefined>(data);

  return (
    <ProgressContext.Provider value={{ userProgress, saveProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const value = useContext(ProgressContext);
  if (value === null) throw new Error("Provider missing");
  return value;
};
