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

  const imageSizes = {
    "file-api-read-en": { width: 554, height: 166 },
    "file-api-edit-en": { width: 573, height: 152 },
    "file-api-read-fr": { width: 516, height: 153 },
    "file-api-edit-fr": { width: 516, height: 157 },
  };

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
        <figure className="p-4">
          <Image
            src={`/img/file-api-read-${locale}.png`}
            alt={t("permissionsHelp.viewImageAlt")}
            width={imageSizes[`file-api-read-${locale}` as keyof typeof imageSizes].width}
            height={imageSizes[`file-api-read-${locale}` as keyof typeof imageSizes].height}
            className="w-full rounded-md border-1 border-gray-300"
          />
          <figcaption className="mt-3 text-sm text-gray-600">
            {t("permissionsHelp.viewImageCaption")}
          </figcaption>
        </figure>

        <figure className="p-4">
          <Image
            src={`/img/file-api-edit-${locale}.png`}
            alt={t("permissionsHelp.editImageAlt")}
            width={imageSizes[`file-api-edit-${locale}` as keyof typeof imageSizes].width}
            height={imageSizes[`file-api-edit-${locale}` as keyof typeof imageSizes].height}
            className="w-full rounded-md border-1 border-gray-300"
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
