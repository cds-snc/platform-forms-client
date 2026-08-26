"use client";
import { memo } from "react";
import { useTranslation } from "@i18n/client";
import { clearTemplateStorage } from "@lib/store/utils";
import { restoreForm } from "../../actions";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";

export const Unarchive = memo(({ id }: { id: string; isPublished: boolean; language: string }) => {
  const { t } = useTranslation("my-forms");

  return (
    <>
      <button
        className="action my-4 block text-sm whitespace-nowrap underline"
        onClick={async () => {
          const { error } = (await restoreForm(id)) ?? {};

          if (error) {
            toast.error(t("errors.formUnarchiveFailed"));
          }
          clearTemplateStorage(id);
        }}
      >
        {t("actions.unarchiveForm")}
      </button>
      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="default" />
      </div>
    </>
  );
});
Unarchive.displayName = "Unarchive";
