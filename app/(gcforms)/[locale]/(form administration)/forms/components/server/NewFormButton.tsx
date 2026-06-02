import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

export const NewFormButton = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  const className =
    "flex h-10 w-10 items-center justify-center rounded-full text-xl shadow bg-indigo-700 border-1 border-indigo-700 hover:bg-indigo-500";

  return (
    <div className="flex flex-col items-center">
      <LinkButton.Primary
        href={`/${language}/form-builder`}
        prefetch={false}
        className={className}
        ariaLabelledby="create-new-form-text"
      >
        <span aria-hidden="true" className="">
          +
        </span>
      </LinkButton.Primary>
      <div id="create-new-form-text" className="mt-1 text-sm text-nowrap text-indigo-700">
        {t("actions.createNewForm")}
      </div>
    </div>
  );
};
