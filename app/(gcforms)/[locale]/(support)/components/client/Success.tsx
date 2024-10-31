import Link from "next/link";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { FocusHeader } from "../client/FocusHeader";
import { useTranslation } from "@i18n/client";

export const Success = ({ lang }: { lang: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <FocusHeader>{t("requestSuccess.title")}</FocusHeader>
      <p className="-mt-8 mb-16 font-bold">{t("requestSuccess.weWillRespond")}</p>
      <div className="mb-16">
        <LinkButton.Primary href={`/${lang}/forms`}>
          {t("requestSuccess.backToForms")}
        </LinkButton.Primary>
      </div>
      <p className="mb-8">
        {t("requestSuccess.forOtherEnquiriesPart1")}{" "}
        <Link href={`https://www.canada.ca/${lang}/contact.html`}>
          {t("requestSuccess.forOtherEnquiriesLink")}
        </Link>{" "}
        {t("requestSuccess.forOtherEnquiriesPart2")}.
      </p>
      <p>{t("requestSuccess.theGCFormsTeam")}</p>
    </>
  );
};
