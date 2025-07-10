import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

export const NewFormButton = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  return (
    <LinkButton.Primary href={`/${language}/form-builder`} className="mr-2">
      <>
        <span aria-hidden="true" className="mr-2 inline-block">
          +
        </span>{" "}
        {t("actions.createNewForm")}
      </>
    </LinkButton.Primary>
  );
};
