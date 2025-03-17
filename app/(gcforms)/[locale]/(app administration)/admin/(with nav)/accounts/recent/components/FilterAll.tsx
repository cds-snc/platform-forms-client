"use client";
import { RoundedButton } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

export const FilterAll = ({
  recentSignupsCount,
  active,
}: {
  recentSignupsCount: number;
  active: boolean;
}) => {
  const router = useRouter();
  const { t } = useTranslation("admin-recent-signups");

  return (
    <RoundedButton
      theme={active ? "primary" : "secondary"}
      onClick={() => {
        router.push("/admin/accounts/recent");
      }}
    >
      <>
        {t("all")} ({recentSignupsCount})
      </>
    </RoundedButton>
  );
};
