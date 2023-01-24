import React from "react";
import { HTMLDownloadTable, HTMLDownloadTableI } from "@components/myforms/HTMLDownload/Table";
import { useTranslation } from "next-i18next";
import copy from "copy-to-clipboard";

export interface HTMLDownloadPageI {
  // id: string;
  title: string;
  lang?: string;
  confirmReceiptCode: string;
}

interface HTMLDownloadPageProps extends HTMLDownloadPageI, HTMLDownloadTableI {}

export const HTMLDownloadPage = (props: HTMLDownloadPageProps) => {
  const { t } = useTranslation(["my-forms"]);
  const {
    // id,
    responseNumber,
    submissionDate,
    questionsAnswers,
    title,
    lang = "en",
    confirmReceiptCode,
  } = props;
  const confirmCodeOutputRef = React.createRef<HTMLSpanElement>();

  function handleCopyCode(elRef: React.RefObject<HTMLSpanElement>) {
    if (copy(confirmReceiptCode)) {
      if (elRef?.current) {
        elRef.current.classList.remove("hidden");
        elRef.current.textContent = t("responseTemplate.copiedCode");
      }
    } else {
      if (elRef?.current) {
        elRef.current.classList.remove("hidden");
        elRef.current.classList.add("text-red-default");
        elRef.current.textContent = t("responseTemplate.errorrCopiedCode");
      }
    }
  }

  return (
    <>
      <nav className="flex items-center" aria-labelledby={"navTitle" + lang}>
        <div id={"navTitle" + lang} className="mr-4 pl-3 pr-4 py-1 bg-gray-800 text-white">
          {t("responseTemplate.jumpTo", { lng: lang })}
        </div>
        <ul className="flex list-none p-0">
          <li className="mr-4">
            <a href={"#columnTable" + lang}>{t("responseTemplate.columnTable", { lng: lang })}</a>
          </li>
          <li className="mr-4">
            <a href={"#rowTable" + lang}>{t("responseTemplate.rowTable", { lng: lang })}</a>
          </li>
          <li className="mr-4">
            <a href={"#confirmReceipt" + lang}>
              {t("responseTemplate.confirmReceipt", { lng: lang })}
            </a>
          </li>
        </ul>
      </nav>

      <h1 className="mt-20">{title}</h1>
      <h2 id={"columnTable" + lang} className="mt-20">
        {t("responseTemplate.columnTable", { lng: lang })}
      </h2>
      <HTMLDownloadTable
        responseNumber={responseNumber}
        submissionDate={submissionDate}
        questionsAnswers={questionsAnswers}
        isRowTable={false}
        lang={lang}
      />

      <h2 id={"rowTable" + lang} className="mt-20">
        {t("responseTemplate.rowTable", { lng: lang })}
      </h2>
      <p className="mb-8">{t("responseTemplate.rowTableInfo", { lng: lang })}</p>
      <HTMLDownloadTable
        responseNumber={responseNumber}
        submissionDate={submissionDate}
        questionsAnswers={questionsAnswers}
        isRowTable={true}
        lang={lang}
      />

      <h2 id={"confirmReceipt" + lang} className="mt-20">
        {t("responseTemplate.confirmReceiptResponse", { lng: lang })}
      </h2>
      <p className="mt-4">{t("responseTemplate.confirmReceiptInfo", { lng: lang })}</p>
      <p className="mt-8 font-bold">{confirmReceiptCode}</p>
      <div className="mt-4 mb-32">
        <button
          className="gc-button--blue"
          aria-label={t("responseTemplate.copyCodeClipboard")}
          onClick={() => {
            handleCopyCode(confirmCodeOutputRef);
          }}
        >
          {t("responseTemplate.copyCode", { lng: lang })}
        </button>
        <span
          ref={confirmCodeOutputRef}
          aria-live="polite"
          className="hidden text-green-default ml-8"
        ></span>
      </div>
    </>
  );
};
