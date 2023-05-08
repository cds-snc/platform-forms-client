/* eslint-disable @next/next/no-img-element  */
import React from "react";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";

const NotSupported = ({ referer }: { referer: string | null }) => {
  const { t } = useTranslation("not-supported");

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

      <div className="flex flex-col h-full">
        <h1 className="md:text-small_h1 text-h1 mb-10">{t("title")}</h1>

        {referer && (
          <>
            <p className="my-8">{t("body1")}</p>
            <div className="flex sm:justify-between">
              <div className="mr-2 w-1/3 h-full py-1 px-2 border-1 border-gray-600 lg:w-auto xl:w-auto sm:w-auto sm:mr-0 break-all">
                {referer}
              </div>
              <button
                className="bg-gray-300 hover:bg-gray-400 active:bg-gray-400 py-1 px-4 sm:p-0.5"
                onClick={() => {
                  navigator.clipboard.writeText(`${referer}`);
                }}
              >
                {t("copy-link")}
              </button>
            </div>
          </>
        )}

        <div>
          <p className="my-8">{t("body2")}</p>
        </div>
        <ul className="list-none p-0">
          <li>
            <a href={t("chrome-link")}>Chrome</a>
          </li>
          <li>
            <a href={t("edge-link")}>Edge</a>
          </li>
          <li>
            <a href={t("mozilla-link")}>Firefox</a>
          </li>
          <li>
            <a href={t("safari-link")}>Safari {t("safari-description")}</a>
          </li>
        </ul>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const referer: string | null = (context.query.referer as string) ?? null;

  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "not-supported"]))),
      referer: referer,
    },
  };
};

export default NotSupported;
