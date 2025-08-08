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
      className="ml-3 text-red-destructive focus:text-white [&_svg]:fill-red [&_svg]:focus:fill-white"
      onClick={resetInput}
      aria-label={`${t("remove", { lng: lang })} ${fileName}`}
    >
      <div className="group ml-1 p-2 pr-3">
        <span className="mr-1 inline-block  underline focus:text-white group-hover:no-underline">
          {t("remove", { lng: lang })}
        </span>
        <CancelIcon className="inline-block " />
      </div>
    </Button>
  );
};
