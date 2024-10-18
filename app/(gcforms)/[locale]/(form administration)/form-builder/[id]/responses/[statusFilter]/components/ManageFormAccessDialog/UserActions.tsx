import { SetStateAction } from "react";
import { TemplateUser } from "./types";
import { useTranslation } from "@i18n/client";
import { cancelInvitation, removeUserFromForm } from "./actions";
import { RefreshIcon } from "@serverComponents/icons/RefreshIcon";
import { ConfirmAction } from "./ConfirmAction";
import { CancelIcon } from "@serverComponents/icons";
import { hasOwnProperty } from "@lib/tsUtils";

export const UserActions = ({
  user,
  expired,
  usersWithAccess,
  setUsersWithAccess,
  handleAddEmail,
  formId,
  loggedInUserEmail,
  index,
}: {
  user: TemplateUser;
  expired: boolean;
  usersWithAccess: TemplateUser[];
  setUsersWithAccess: (value: SetStateAction<TemplateUser[]>) => void;
  handleAddEmail: (email: string) => void;
  formId: string;
  loggedInUserEmail: string;
  index: number;
}) => {
  const { t } = useTranslation("manage-form-access");

  const handleRemoveUser = async (userId: string) => {
    const result = await removeUserFromForm(userId, formId);
    if (result.success) {
      setUsersWithAccess(usersWithAccess.filter((user) => user.id !== userId));
      return true;
    }
    return false;
  };

  const handleResendInvitation = async (email: string) => {
    handleAddEmail(email);
  };

  const handleCancelInvitation = async (id: string): Promise<boolean> => {
    cancelInvitation(id);
    setUsersWithAccess(usersWithAccess.filter((user) => user.id !== id));
    return true;
  };

  return (
    <>
      {expired ? (
        <div>
          <div className="flex flex-row gap-1">
            <span>{user.expired ? t("expired") : t("invited")}</span>
            <div className="inline-block">
              <button onClick={() => handleResendInvitation(user.email)}>
                <RefreshIcon title={t("resend")} />
              </button>
            </div>
            <ConfirmAction
              buttonLabel={t("delete")}
              confirmString=""
              buttonTheme="destructive"
              icon={<CancelIcon title={t("deleteInvitation")} />}
              callback={() => handleCancelInvitation(user.id)}
            />
          </div>
        </div>
      ) : (
        <div>
          {/* Disable delete for current user or only remaining user */}
          {loggedInUserEmail === user.email ||
          (index === 0 &&
            usersWithAccess.filter((u) => !hasOwnProperty(u, "expired")).length <= 1) ? (
            <span></span>
          ) : (
            <ConfirmAction
              callback={() => handleRemoveUser(user.id)}
              confirmString={t("areYouSure")}
              buttonLabel={t("remove")}
            />
          )}
        </div>
      )}
    </>
  );
};
