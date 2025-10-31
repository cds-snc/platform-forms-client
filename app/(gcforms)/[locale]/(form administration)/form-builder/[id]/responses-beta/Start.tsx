"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@i18n/client";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useResponsesContext } from "./context/ResponsesContext";

export const Start = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const { t } = useTranslation("response-api");

  const { isCompatible } = useResponsesContext();

  if (!isCompatible) {
    router.push(`/${locale}/form-builder/${id}/responses-beta/not-supported`);
    return null;
  }

  return (
    <div>
      <p className="mb-4 text-xl">{t("startPage.intro")}</p>
      <h3 className="mt-6 text-lg font-semibold">{t("startPage.beforeStart.heading")}</h3>

      <div className="mb-8">
        <ul className="mt-3 list-disc pl-6">
          <li className="pb-2">
            <strong>{t("startPage.beforeStart.generateKey")}</strong>
            <div className="text-sm text-slate-700">
              {t("startPage.beforeStart.generateKeyDetail")}
            </div>
          </li>
          <li>
            <strong>{t("startPage.beforeStart.browserSupport")}</strong>
            <div className="text-sm text-slate-700">
              {t("startPage.beforeStart.browserSupportDetail")}
            </div>
          </li>
        </ul>

        <hr className="my-6 border-t border-black" />

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("startPage.steps.heading")}</h3>
        </div>
        <ol className="mt-3 list-decimal pl-6">
          <li className="pb-3">
            <strong>{t("startPage.steps.uploadKey.title")}</strong>
            <div className="text-sm text-slate-700">{t("startPage.steps.uploadKey.detail")}</div>
          </li>
          <li className="pb-3">
            <strong>{t("startPage.steps.chooseLocation.title")}</strong>
            <div className="text-sm text-slate-700">
              {t("startPage.steps.chooseLocation.detail")}
            </div>
          </li>
          <li className="pb-3">
            <strong>{t("startPage.steps.selectFormat.title")}</strong>
            <div className="text-sm text-slate-700">{t("startPage.steps.selectFormat.detail")}</div>
          </li>
        </ol>
      </div>

      <LinkButton.Primary href={`/${locale}/form-builder/${id}/responses-beta/load-key`}>
        {t("startPage.nextButton")}
      </LinkButton.Primary>
    </div>
  );
};
