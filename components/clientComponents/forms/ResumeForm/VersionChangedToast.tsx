import { useTranslation } from "@i18n/client";
import { WarningIcon } from "@serverComponents/icons";

export const VersionChangedToast = () => {
  const { t } = useTranslation("common");

  return (
    <div className="w-full px-4 py-2 text-black">
      <div className="flex items-start gap-6">
        <div className="flex shrink-0 flex-col items-center self-stretch">
          <div className="h-8 w-1.5 bg-[#a86e00]" />
          <WarningIcon className="my-3 size-8 fill-[#a86e00]" />
          <div className="min-h-12 w-1.5 flex-1 bg-[#a86e00]" />
        </div>
        <div>
          <h3 className="mt-0! mb-2! pb-0 text-2xl leading-tight font-semibold text-black">
            {t("saveAndResume.formUpdatedWarning.title")}
          </h3>
          <p className="mb-0 text-xl leading-relaxed text-black">
            {t("saveAndResume.formUpdatedWarning.message")}
          </p>
        </div>
      </div>
    </div>
  );
};
