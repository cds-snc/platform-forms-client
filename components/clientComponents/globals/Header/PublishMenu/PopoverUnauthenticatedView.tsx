import Link from "next/link";

type Translate = (key: string) => string;

export const PopoverUnauthenticatedView = ({
  t,
  signInLink,
  createAccountLink,
}: {
  t: Translate;
  signInLink: string;
  createAccountLink: string;
}) => {
  return (
    <div>
      <p className="text-gray-dark mb-3 text-base font-semibold">
        {t("loggedOutTab.publish.title")}
      </p>
      <p className="mb-4 text-sm text-slate-700">
        {t("loggedOutTab.publish.text1")} <Link href={signInLink}>{t("loggedOutTab.text2")}</Link>.{" "}
        {t("loggedOutTab.text3")} <Link href={createAccountLink}>{t("loggedOutTab.text4")}</Link>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={signInLink}
          className="inline-block rounded border-2 border-slate-700 bg-slate-700 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-slate-800"
        >
          {t("loggedOutTab.signinButton")}
        </Link>
        <Link
          href={createAccountLink}
          className="inline-block rounded border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-900 no-underline hover:bg-slate-100"
        >
          {t("loggedOutTab.createButton")}
        </Link>
      </div>
    </div>
  );
};
