import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals";

export const NewFormButton = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  return (
    <div className="inline">
      <LinkButton.Primary href={`/${language}/form-builder`}>
        <>
          <span aria-hidden="true" className="mr-2 inline-block">
            +
          </span>{" "}
          {t("actions.createNewForm")}
        </>
      </LinkButton.Primary>
    </div>
  );
};
