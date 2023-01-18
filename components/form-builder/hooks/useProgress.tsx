import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";
import { Responses } from "@lib/types";

interface ProgressType {
  userProgress?: Responses | undefined;
  importProgress: Dispatch<SetStateAction<Responses | undefined>>;
  saveProgress: (values?: Responses | undefined, formId?: string | undefined) => void;
}

export const ProgressContext = createContext<ProgressType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [userProgress, importProgress] = useState<Responses | undefined>({});

  const saveProgress = (values?: Responses | undefined, formId?: string) => {
    const instructions = `To import your progress, open the form you were working on:\n\n
    - Click the "Import progress" button
    - Select this file.\n\n`;

    const base64 = Buffer.from(
      JSON.stringify({
        id: formId,
        responses: values,
      })
    ).toString("base64");

    const blob = new Blob([`${instructions}@@==${base64}`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-progress.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProgressContext.Provider value={{ userProgress, importProgress, saveProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const value = useContext(ProgressContext);
  if (value === null) {
    return {
      importProgress: () => null,
      saveProgress: () => null,
      userProgress: undefined,
    };
  }
  return value;
};
