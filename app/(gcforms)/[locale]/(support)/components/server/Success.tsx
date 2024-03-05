import { serverTranslation } from "@i18n";
import Link from "next/link";
import { PrimaryLinkButton } from "@clientComponents/globals/Buttons";
import { FocusHeader } from "../client/FocusHeader";

export const Success = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("form-builder");
  return (
    <>
      <FocusHeader>{t("requestSuccess.title")}</FocusHeader>
      <p className="mb-16 mt-[-2rem] font-bold">{t("requestSuccess.weWillRespond")}</p>
      <div className="mb-16">
        <PrimaryLinkButton href={`${language}/forms`}>
          {t("requestSuccess.backToForms")}
        </PrimaryLinkButton>
      </div>
      <p className="mb-8">
        {t("requestSuccess.forOtherEnquiriesPart1")}{" "}
        <Link href={`https://www.canada.ca/${language}/contact.html`}>
          {t("requestSuccess.forOtherEnquiriesLink")}
        </Link>{" "}
        {t("requestSuccess.forOtherEnquiriesPart2")}.
      </p>
      <p>{t("requestSuccess.theGCFormsTeam")}</p>
    </>
  );
};
