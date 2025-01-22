"use client";
import { RoundedButton } from "@clientComponents/globals";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export const FilterFlagged = ({
  flaggedSignupsCount,
  active,
}: {
  flaggedSignupsCount: number;
  active: boolean;
}) => {
  const router = useRouter();
  const { t } = useTranslation("admin-recent-signups");

  return (
    <RoundedButton
      theme={active ? "primary" : "secondary"}
      onClick={() => {
        router.push("/admin/accounts/recent?filter=flagged");
      }}
    >
      <>
        {t("accountsFlagged")} ({flaggedSignupsCount})
      </>
    </RoundedButton>
  );
};
