"use client";
import { Danger, Success } from "@clientComponents/globals/Alert/Alert";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

export const Messages = ({ success, error }: { success: string; error: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-settings");
  const router = useRouter();

  const dismiss = () => {
    // Removes the queryParam used to show the last message
    router.push(`/${language}/admin/settings`);
  };

  return (
    <>
      {success && (
        <Success title={t(success)} dismissible={true} focussable={true} onDismiss={dismiss} />
      )}
      {error && (
        <Danger title={t(error)} dismissible={true} focussable={true} onDismiss={dismiss} />
      )}
    </>
  );
};
