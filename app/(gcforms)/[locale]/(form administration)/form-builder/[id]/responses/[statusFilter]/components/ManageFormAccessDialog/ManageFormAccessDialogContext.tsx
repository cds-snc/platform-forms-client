import React, { createContext, useState, ReactNode, SetStateAction } from "react";

interface ManageFormAccessDialogContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formId: string;
  setFormId: (formId: string) => void;
  emailList: string[];
  setEmailList: (emailList: string[]) => void;
  message: string;
  setMessage: (message: string) => void;
  errors: string[];
  setErrors: (value: SetStateAction<string[]>) => void;
}

export const ManageFormAccessDialogContext = createContext<
  ManageFormAccessDialogContextProps | undefined
>(undefined);

export const ManageFormAccessDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formId, setFormId] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <ManageFormAccessDialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        formId,
        setFormId,
        emailList,
        setEmailList,
        message,
        setMessage,
        errors,
        setErrors,
      }}
    >
      {children}
    </ManageFormAccessDialogContext.Provider>
  );
};
