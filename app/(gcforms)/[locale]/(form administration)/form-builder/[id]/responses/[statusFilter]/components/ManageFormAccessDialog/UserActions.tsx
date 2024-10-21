import { SetStateAction } from "react";
import { TemplateUser } from "./types";
import { useTranslation } from "@i18n/client";
import { cancelInvitation, removeUserFromForm } from "./actions";
import { RefreshIcon } from "@serverComponents/icons/RefreshIcon";
import { ConfirmAction } from "./ConfirmAction";
import { CancelIcon } from "@serverComponents/icons";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";

export const UserActions = ({
  user,
  isInvitation,
  usersWithAccess,
  setUsersWithAccess,
  handleAddEmail,
  formId,
  disableRow,
}: {
  user: TemplateUser;
  isInvitation: boolean;
  usersWithAccess: TemplateUser[];
  setUsersWithAccess: (value: SetStateAction<TemplateUser[]>) => void;
  handleAddEmail: (email: string) => void;
  formId: string;
  disableRow: boolean;
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
      {isInvitation ? (
        <div>
          <div className="flex flex-row gap-1">
            <span>{user.expired ? t("expired") : t("invited")}</span>
            <div className="inline-block">
              <Tooltip.Simple text={t("resend")} side="top">
                <button onClick={() => handleResendInvitation(user.email)}>
                  <RefreshIcon
                    title={t("resend")}
                    className="rounded-full border-1.5 border-transparent hover:border-blue-focus"
                  />
                </button>
              </Tooltip.Simple>
            </div>
            <Tooltip.Simple text={t("deleteInvitation")} side="top">
              <ConfirmAction
                buttonLabel={t("delete")}
                confirmString=""
                buttonTheme="destructive"
                icon={
                  <CancelIcon
                    title={t("deleteInvitation")}
                    className="rounded-full border-1.5 border-transparent hover:border-blue-focus"
                  />
                }
                callback={() => handleCancelInvitation(user.id)}
              />
            </Tooltip.Simple>
          </div>
        </div>
      ) : (
        <div>
          {/* Disable delete for current user or only remaining user */}
          {disableRow ? (
            <span></span>
          ) : (
            <Tooltip.Simple text={t("remove")} side="top">
              <ConfirmAction
                callback={() => handleRemoveUser(user.id)}
                confirmString={t("areYouSure")}
                buttonLabel={t("remove")}
              />
            </Tooltip.Simple>
          )}
        </div>
      )}
    </>
  );
};
