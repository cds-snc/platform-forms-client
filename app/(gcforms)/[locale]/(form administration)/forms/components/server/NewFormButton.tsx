import { cn } from "@lib/utils";
import { serverTranslation } from "@i18n";

import { themes } from "@clientComponents/globals";

export const NewFormButton = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  return (
    <div className="mr-6 inline">
      <a
        className={cn(themes.primary, themes.base, themes.htmlLink)}
        href={`/${language}/form-builder`}
      >
        <>
          <span aria-hidden="true" className="mr-2 inline-block">
            +
          </span>{" "}
          {t("actions.createNewForm")}
        </>
      </a>
    </div>
  );
};
