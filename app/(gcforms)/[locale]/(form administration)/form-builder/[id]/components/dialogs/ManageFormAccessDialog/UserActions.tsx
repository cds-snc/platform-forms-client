import { SetStateAction } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleRemoveUser = async (userId: string) => {
    const result = await removeUserFromForm(userId, formId);
    if (result.success) {
      setUsersWithAccess(usersWithAccess.filter((existingUser) => existingUser.id !== userId));
      router.refresh();
      return true;
    }
    return false;
  };

  const handleResendInvitation = async (email: string) => {
    handleAddEmail(email);
  };

  const handleCancelInvitation = async (id: string): Promise<boolean> => {
    await cancelInvitation(id);
    setUsersWithAccess(usersWithAccess.filter((existingUser) => existingUser.id !== id));
    router.refresh();
    return true;
  };

  return (
    <>
      {isInvitation ? (
        <div>
          <div className="flex flex-row gap-1">
            <span>{user.expired ? t("expired") : t("invited")}</span>
            <div className="inline-block">
              <Tooltip.Simple text={t("resend", { email: user.email })} side="top">
                <button onClick={() => handleResendInvitation(user.email)}>
                  <RefreshIcon
                    title={t("resend")}
                    className="border-1.5 hover:border-blue-focus rounded-full border-transparent"
                  />
                </button>
              </Tooltip.Simple>
            </div>
            <Tooltip.Simple text={t("deleteInvitation", { email: user.email })} side="top">
              <ConfirmAction
                buttonLabel={t("delete")}
                confirmString=""
                buttonTheme="destructive"
                icon={
                  <CancelIcon
                    title={t("deleteInvitation")}
                    className="border-1.5 hover:border-blue-focus rounded-full border-transparent"
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
            <Tooltip.Simple text={t("remove", { email: user.email })} side="top">
              <ConfirmAction
                callback={() => handleRemoveUser(user.id)}
                confirmString={t("areYouSure")}
                buttonLabel={t("removeButtonLabel", { email: user.email })}
              />
            </Tooltip.Simple>
          )}
        </div>
      )}
    </>
  );
};
