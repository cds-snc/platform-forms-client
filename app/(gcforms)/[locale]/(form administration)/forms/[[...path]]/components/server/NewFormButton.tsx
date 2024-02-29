import { serverTranslation } from "@i18n";
import { PrimaryLinkButton } from "@clientComponents/globals/Buttons";

export const NewFormButton = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  return (
    <div className="inline">
      <PrimaryLinkButton href={`/${language}/form-builder`}>
        <>
          <span aria-hidden="true" className="mr-2 inline-block">
            +
          </span>{" "}
          {t("actions.createNewForm")}
        </>
      </PrimaryLinkButton>
    </div>
  );
};
