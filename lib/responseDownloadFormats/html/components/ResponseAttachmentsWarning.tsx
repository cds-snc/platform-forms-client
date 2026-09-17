import { themes } from "@clientComponents/globals/Buttons/themes";
import { WarningIcon } from "@serverComponents/icons";
import { TFunction } from "i18next";
import { Language } from "@root/lib/types/form-builder-types";

export const ResponseAttachmentsWarning = ({
  responseAttachmentsUrl,
  lang,
  t,
}: {
  responseAttachmentsUrl: string;
  lang: Language;
  t: TFunction<string | string[], undefined>;
}) => (
  <div
    className="laptop:rounded-md relative my-8 flex items-start rounded-sm bg-yellow-50 p-4"
    role="alert"
  >
    <div className="mr-3 shrink-0 text-yellow-700 [&_svg]:fill-yellow-700" data-testid="alert-icon">
      <WarningIcon className="h-12 w-12" />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="!m-0 text-xl leading-7 font-semibold text-slate-950">
        {t("responseTemplate.attachmentsWarningTitle", { lng: lang, ns: "my-forms" })}
      </h3>
      <div>
        <p className="mt-2 mb-5">
          {t("responseTemplate.attachmentsWarningMessage", { lng: lang, ns: "my-forms" })}
        </p>
        <a
          href={responseAttachmentsUrl}
          className={`${themes.base} ${themes.secondary} ${themes.htmlLink}`}
        >
          {t("responseTemplate.downloadAttachments", { lng: lang, ns: "my-forms" })}
        </a>
      </div>
    </div>
  </div>
);
