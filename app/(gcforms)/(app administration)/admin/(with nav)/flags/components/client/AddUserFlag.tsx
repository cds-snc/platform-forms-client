"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation"; // Add this import

export const AddUserFlag = () => {
  const { t } = useTranslation("admin-flags");
  const router = useRouter(); // Initialize router

  return (
    <Button
      type="submit"
      theme="primary"
      className="text-sm whitespace-nowrap"
      onClick={() => router.push("/admin/accounts")}
    >
      {t("addFlag")}
    </Button>
  );
};
