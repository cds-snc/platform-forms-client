import { TemplateUser } from "./types";

type ManageUsersProps = {
  selectedEmail: string;
  setSelectedEmail: (email: string) => void;
  usersWithAccess: TemplateUser[];
  loggedInUserEmail: string;
  handleAddEmail: (email: string) => void;
  emailList: string[];
};

export const ManageUsers = ({
  setSelectedEmail,
  usersWithAccess,
  loggedInUserEmail,
  handleAddEmail,
  emailList,
}: ManageUsersProps) => {
  return (
    //
  );
};
