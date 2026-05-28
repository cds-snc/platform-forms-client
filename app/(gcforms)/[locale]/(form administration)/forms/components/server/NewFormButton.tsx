import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

export const NewFormButton = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  return (
    <div className="flex flex-col items-center">
      <LinkButton.Primary
        href={`/${language}/form-builder`}
        prefetch={false}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-xl text-white shadow hover:bg-slate-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        ariaLabelledby="create-new-form-text"
      >
        <span aria-hidden="true" className="">
          +
        </span>
      </LinkButton.Primary>
      <div id="create-new-form-text" className="mt-1 text-sm text-nowrap text-blue-700">
        {t("actions.createNewForm")}
      </div>
    </div>
  );
};
