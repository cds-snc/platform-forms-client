import React, { createContext, useState, ReactNode } from "react";

interface ManageFormAccessDialogContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formId: string;
  setFormId: (formId: string) => void;
  emailList: string[];
  setEmailList: (emailList: string[]) => void;
}

export const ManageFormAccessDialogContext = createContext<
  ManageFormAccessDialogContextProps | undefined
>(undefined);

export const ManageFormAccessDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formId, setFormId] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);

  return (
    <ManageFormAccessDialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        formId,
        setFormId,
        emailList,
        setEmailList,
      }}
    >
      {children}
    </ManageFormAccessDialogContext.Provider>
  );
};

export const useManageFormAccessDialog = () => {
  const context = React.useContext(ManageFormAccessDialogContext);
  if (context === undefined) {
    throw new Error(
      "useManageFormAccessDialog must be used within a ManageFormAccessDialogProvider"
    );
  }
  return context;
};
