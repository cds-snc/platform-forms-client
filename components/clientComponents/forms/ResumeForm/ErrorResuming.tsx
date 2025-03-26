import { useTranslation } from "@i18n/client";
import { WarningIcon } from "@serverComponents/icons";

export const ErrorResuming = ({ errorCode }: { errorCode?: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const title = t("saveAndResume.resumeUploadError.title", {
    lng: language,
    ns: "common",
  });

  const message = t("saveAndResume.resumeUploadError.description", {
    lng: language,
    ns: "common",
  });

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-2 text-xl font-semibold">
        <WarningIcon className="mr-1 mt-[-4] inline-block size-8 fill-red-800" /> {title}
      </h3>
      <p className="mb-2 text-black">{message} </p>
      <p className="mb-5 text-sm text-black">
        {errorCode && t("saveAndResume.resumeUploadError.errorCode", { code: errorCode })}
      </p>
    </div>
  );
};
