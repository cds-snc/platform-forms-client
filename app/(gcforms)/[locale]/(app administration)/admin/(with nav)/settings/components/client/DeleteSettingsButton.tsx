"use client";
import { useTranslation } from "@i18n/client";
import { deleteSetting } from "../../actions";
import { Button } from "@clientComponents/globals";
import { useRouter } from "next/navigation";

export const DeleteSettingsButton = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-settings");
  const router = useRouter();

  const deleteSettingWrapper = async (id: string) => {
    await deleteSetting(id).catch(() => {
      router.push(`/${language}/admin/settings?success=errorDeleting`);
    });
    router.push(`/${language}/admin/settings?success=deleted`);
  };

  return (
    <Button
      type="button"
      theme="destructive"
      className="text-sm whitespace-nowrap"
      onClick={() => deleteSettingWrapper(id)}
    >
      {t("deleteSetting")}
    </Button>
  );
};
