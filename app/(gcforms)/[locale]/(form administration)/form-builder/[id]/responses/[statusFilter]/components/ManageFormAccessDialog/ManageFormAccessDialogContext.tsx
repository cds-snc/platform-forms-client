import React, { createContext, useState, ReactNode, SetStateAction } from "react";
import { TemplateUser } from "./types";

interface ManageFormAccessDialogContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedEmail: string;
  setSelectedEmail: (selectedEmail: string) => void;
  formId: string;
  setFormId: (formId: string) => void;
  emailList: string[];
  setEmailList: (emailList: string[]) => void;
  message: string;
  setMessage: (message: string) => void;
  usersWithAccess: TemplateUser[];
  setUsersWithAccess: (usersWithAccess: TemplateUser[]) => void;
  errors: string[];
  setErrors: (value: SetStateAction<string[]>) => void;
  // loggedInUserId: string;
}

export const ManageFormAccessDialogContext = createContext<
  ManageFormAccessDialogContextProps | undefined
>(undefined);

export const ManageFormAccessDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [formId, setFormId] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [usersWithAccess, setUsersWithAccess] = useState<TemplateUser[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // const [loggedInUserId, setLoggedInUserId] = useState("");

  return (
    <ManageFormAccessDialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        selectedEmail,
        setSelectedEmail,
        formId,
        setFormId,
        emailList,
        setEmailList,
        message,
        setMessage,
        usersWithAccess,
        setUsersWithAccess,
        errors,
        setErrors,
      }}
    >
      {children}
    </ManageFormAccessDialogContext.Provider>
  );
};
