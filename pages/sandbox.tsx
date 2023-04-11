import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getFormByStatus } from "../lib/integration/crud";
import { getProperty } from "../lib/formBuilder";
import { checkOne } from "../lib/flags";
import { formCache } from "../lib/cache";
import { GetServerSideProps } from "next";
import { PublicFormRecord } from "@lib/types";

interface SandboxProps {
  formsList: Array<PublicFormRecord>;
}
const Sandbox = ({ formsList }: SandboxProps) => {
  const { t, i18n } = useTranslation("welcome");

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>

      <div className="gc-homepage">
        <div>
          <h2>{t("product.title")}</h2>
          <p>{t("product.text")}</p>
        </div>
        <div>
          <h2>{t("formList.title")}</h2>
          <ul className="link-list custom">
            {formsList.map((form) => {
              const formTitle = form.formConfig.form[getProperty("title", i18n.language)];
              return (
                <li key={`link-${form.formID}`}>
                  <Link href={`/id/${form.formID}`}>{formTitle && formTitle.toString()}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2>{t("product.preview.title")}</h2>
          <ul className="link-list custom">
            <li>
              <Link href="/builder-preview">{t("product.preview.link")}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t("design.title")}</h2>
          <p>{t("design.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://platform-storybook.herokuapp.com/">{t("design.system.title")}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t("technology.title")}</h2>
          <p>{t("technology.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://github.com/cds-snc/platform-forms-node/">
                {t("technology.git.title")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sandboxActive = await checkOne("sandbox");

  if (!sandboxActive) {
    return { redirect: { destination: `/${context.locale}/welcome-bienvenue`, permanent: false } };
  }
  const formsList = async () => {
    return await formCache.unpublished.check().then(async (cachedValue) => {
      if (cachedValue) {
        return cachedValue;
      }
      return await getFormByStatus(false).then((freshValue) => {
        formCache.unpublished.set(freshValue);
        return freshValue;
      });
    });
  };

  return {
    props: {
      formsList: await formsList(),
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "welcome"]))),
    }, // will be passed to the page component as props
  };
};

export default Sandbox;
