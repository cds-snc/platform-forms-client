import { useTranslation } from "@i18n/client";

import { CancelIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals/Buttons/Button";

export const ResetButton = ({
  resetInput,
  fileName,
  lang,
}: {
  resetInput: () => void;
  fileName: string;
  lang: string | undefined;
}) => {
  const { t } = useTranslation("common", { lng: lang });
  return (
    <Button
      theme="link"
      className="text-red-destructive [&_svg]:fill-red ml-3 focus:text-white focus:[&_svg]:fill-white"
      onClick={resetInput}
      aria-label={`${t("remove", { lng: lang })} ${fileName}`}
    >
      <div className="group ml-1 p-2 pr-3">
        <span className="mr-1 inline-block underline group-hover:no-underline focus:text-white">
          {t("remove", { lng: lang })}
        </span>
        <CancelIcon className="inline-block" />
      </div>
    </Button>
  );
};
