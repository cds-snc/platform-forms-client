import { useTranslation } from "@i18n/client";
import { Close } from "@serverComponents/icons/Close";
import { HelpIcon } from "@serverComponents/icons/HelpIcon";
import Image from "next/image";

export const PermissionsHelpButton = () => {
  const { t } = useTranslation("browser-check");
  return (
    <button
      popoverTarget="permissions-popover"
      className="ml-1 inline-flex items-center align-middle"
      aria-label={t("permissionsHelp.ariaLabel")}
      data-testid="permissions-help-button"
    >
      <HelpIcon className="inline-block size-5" />
    </button>
  );
};

export const PermissionsPopover = ({ locale }: { locale: string }) => {
  const { t } = useTranslation("browser-check", { lang: locale });

  const handleClose = () => {
    const popover = document.getElementById("permissions-popover") as HTMLElement & {
      hidePopover: () => void;
    };
    if (popover?.hidePopover) {
      popover.hidePopover();
    }
  };

  return (
    <div
      id="permissions-popover"
      popover="auto"
      className="max-h-[80vh] max-w-2xl overflow-y-auto rounded-xl border-1 border-gray-500 p-10"
      data-testid="permissions-popover"
    >
      <h2 className="mb-6" data-testid="permissions-popover-title">
        {t("permissionsHelp.title")}
      </h2>

      <p className="mb-6">{t("permissionsHelp.description")}</p>

      <div className="space-y-6">
        <figure className="border-1 border-gray-200 p-4">
          <Image
            src={`/img/file-api-read-${locale}.png`}
            alt={t("permissionsHelp.viewImageAlt")}
            width={560}
            height={160}
            className="w-full"
          />
          <figcaption className="mt-3 text-sm text-gray-600">
            {t("permissionsHelp.viewImageCaption")}
          </figcaption>
        </figure>

        <figure className="border-1 border-gray-200 p-4">
          <Image
            src={`/img/file-api-edit-${locale}.png`}
            alt={t("permissionsHelp.editImageAlt")}
            width={560}
            height={160}
            className="w-full"
          />
          <figcaption className="mt-3 text-sm text-gray-600">
            {t("permissionsHelp.editImageCaption")}
          </figcaption>
        </figure>
      </div>

      <button
        type="button"
        className="group absolute right-0 top-0 mr-4 mt-4 rounded p-2 hover:bg-gray-100 focus:bg-gray-100"
        aria-label={t("permissionsHelp.close")}
        onClick={handleClose}
      >
        <Close className="inline-block group-focus:fill-white-default" />
      </button>
    </div>
  );
};
