"use client";
import { Button } from "@clientComponents/globals";
import { removeUserFlag } from "../../actions";
import { useTranslation } from "@i18n/client";

export const UserFlag = ({
  user,
  flag,
  userId,
}: {
  user: string;
  flag: string;
  userId: string;
}) => {
  const { t } = useTranslation("admin-flags");

  return (
    <tr className="border-2">
      <td className="p-2">{user}</td>
      <td className="border-2 border-dashed p-2 text-center">{flag}</td>
      <td className="p-2 text-center">
        <Button
          type="submit"
          theme="primary"
          className="whitespace-nowrap text-sm"
          onClick={async () => {
            await removeUserFlag(userId, flag);
          }}
        >
          {t("remove")}
        </Button>
      </td>
    </tr>
  );
};
