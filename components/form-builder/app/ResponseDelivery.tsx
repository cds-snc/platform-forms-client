import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store";
import { SetResponseDelivery } from "./SetResponseDelivery";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="block text-sm mb-1" id={id}>
      {children}
    </span>
  );
};

export const ResponseDelivery = () => {
  const { t, i18n } = useTranslation("form-builder");

  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>

      <SetResponseDelivery />

      {isPublished && (
        <div className="mb-10">
          <Label htmlFor="response-delivery">{t("settingsResponseTitle")}</Label>
          <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
          <HintText id="response-delivery-hint-2">{t("settingsResponseHint2")}</HintText>
          <div className="mt-4 mb-4 p-4 bg-purple-200 text-sm inline-block">
            {t("settingsResponseNotePublished")}
            <a
              href={`/${i18n.language}/form-builder/support`}
              className="ml-2"
              target="_blank"
              rel="noreferrer"
            >
              {t("contactSupport")}
            </a>
            .
          </div>
        </div>
      )}
    </>
  );
};
