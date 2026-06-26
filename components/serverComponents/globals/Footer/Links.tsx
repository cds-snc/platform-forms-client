import Link from "next/link";
import { I18n } from "@i18n";

const BulletPoint = () => {
  return <span className="px-3">&#x2022;</span>;
};

export const FormBuilderLinks = async () => {
  return (
    <span className="mr-10 inline-block">
      <Link
        className="whitespace-nowrap"
        //ToDo convert to a client component or bring data from articles inhouse
        href="https://articles.alpha.canada.ca/forms-formulaires/fr/?utm_source=FR_FormsFooter&utm_medium=Product&utm_campaign=forms_product"
        target="_blank"
        prefetch={false}
      >
        <I18n i18nKey="footer.about.desc" namespace="common" />
      </Link>
      <BulletPoint />
      <Link className="whitespace-nowrap" href="/terms-of-use" prefetch={false}>
        <I18n i18nKey="footer.terms-of-use.desc" namespace="common" />
      </Link>

      <BulletPoint />
      <Link className="whitespace-nowrap" href="/sla" prefetch={false}>
        <I18n i18nKey="footer.sla.desc" namespace="common" />
      </Link>

      <BulletPoint />
      <Link href="/support" prefetch={false}>
        <I18n i18nKey="footer.support.desc" namespace="common" />
      </Link>
    </span>
  );
};

export const DefaultLinks = async () => {
  return (
    <Link href="/fr/terms-and-conditions" prefetch={false}>
      <I18n i18nKey="footer.terms-and-conditions.desc" namespace="common" />
    </Link>
  );
};
