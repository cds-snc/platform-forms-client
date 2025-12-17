"use client";
import { useTranslation } from "@i18n/client";
import { clearTemplateStorage } from "@lib/store/utils";
import { cloneForm, restoreForm } from "../../actions";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";

export const Unarchive = ({
  id,
  isPublished,
  language,
}: {
  id: string;
  isPublished: boolean;
  language: string;
}) => {
  const { t } = useTranslation("my-forms");

  return (
    <>
      <button
        className="action my-4 block whitespace-nowrap text-sm underline"
        onClick={async () => {
          if (!isPublished) {
            const { error } = (await restoreForm(id)) ?? {};

            if (error) {
              toast.error(t("errors.formUnarchiveFailed"));
            }
            clearTemplateStorage(id);
          } else {
            try {
              const res = await cloneForm(id, true);
              if (res && res.formRecord && !res.error) {
                toast.success(t("card.menu.cloneSuccess"));
                window.location.href = `/${language}/form-builder/${res.formRecord.id}/edit`;
                return;
              }
              throw new Error(res?.error || "Clone failed");
            } catch (e) {
              toast.error(t("card.menu.cloneFailed"));
            }
          }
        }}
      >
        {isPublished ? t("actions.duplicatePublishedForm") : t("actions.unarchiveForm")}
      </button>
      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="default" />
      </div>
    </>
  );
};
