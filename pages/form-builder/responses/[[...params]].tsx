import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import { NextPageWithLayout } from "@pages/_app";
import { PageTemplate, Template } from "@components/form-builder/app";
import { Button, Input, useDialogRef, Dialog } from "@components/form-builder/app/shared";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";

interface ResponsesProps {
  todo?: string;
}

const Responses: NextPageWithLayout<ResponsesProps> = () => {
  const { t } = useTranslation("form-builder");
  const secondaryButtonClass =
    "whitespace-nowrap relative py-0 px-2 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500  bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500";

  const dialogConfirmReceipt = useDialogRef();
  const [isShowConfirmReceiptDialog, setIsShowConfirmReceiptDialog] = useState(false);
  const dialogConfirmReceiptHandleClose = () => {
    setIsShowConfirmReceiptDialog(false);
    dialogConfirmReceipt.current?.close();
  };
  const buttonActionsConfirmReceipt = (
    <Button onClick={dialogConfirmReceiptHandleClose}>{t("responses.confirmReceipt")}</Button>
  );

  const dialogReportProblems = useDialogRef();
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);
  const dialogReportProblemsHandleClose = () => {
    setIsShowReportProblemsDialog(false);
    dialogReportProblems.current?.close();
  };
  const buttonActionsReportProblems = (
    <Button onClick={dialogReportProblemsHandleClose}>{t("responses.reportProblems")}</Button>
  );

  return (
    <>
      <PageTemplate title={t("responses.title")}>
        <div className="flex justify-between items-baseline">
          <h1 className="gc-h2">{t("responses.title")}</h1>
          <nav className="flex">
            <button
              onClick={() => setIsShowConfirmReceiptDialog(true)}
              type="button"
              className={`mr-4 ${secondaryButtonClass}`}
            >
              {t("responses.confirmReceipt")}
            </button>
            <button
              onClick={() => setIsShowReportProblemsDialog(true)}
              type="button"
              className={`mr-4 ${secondaryButtonClass}`}
            >
              {t("responses.reportProblems")}
            </button>
            <StyledLink href="setup" className={`no-underline ${secondaryButtonClass}`}>
              {t("responses.changeSetup")}
            </StyledLink>
          </nav>
        </div>
        <div>TODO responses table here</div>
        <div>TODO download button here</div>
      </PageTemplate>

      {isShowConfirmReceiptDialog && (
        <Dialog
          title={t("todo")}
          dialogRef={dialogConfirmReceipt}
          actions={buttonActionsConfirmReceipt}
          handleClose={dialogConfirmReceiptHandleClose}
        >
          <h2>TODO Confirm Receipt</h2>
        </Dialog>
      )}

      {isShowReportProblemsDialog && (
        <Dialog
          title={t("todo")}
          dialogRef={dialogReportProblems}
          actions={buttonActionsReportProblems}
          handleClose={dialogReportProblemsHandleClose}
        >
          <h2>TODO Report Problems</h2>
        </Dialog>
      )}
    </>
  );
};

Responses.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, id }, locale }) => {
    {
      checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

      // const templates = (await getAllTemplates(ability, id)).map((template) => {
      //   const {
      //     id,
      //     form: { titleEn = "", titleFr = "" },
      //     name,
      //     isPublished,
      //     updatedAt,
      //   } = template;
      //   return {
      //     id,
      //     titleEn,
      //     titleFr,
      //     name,
      //     isPublished,
      //     date: updatedAt,
      //     url: `/${locale}/id/${id}`,
      //   };
      // });

      return {
        props: {
          // templates,
          ...(locale && (await serverSideTranslations(locale, ["form-builder", "common"]))),
        },
      };
    }
  }
);

export default Responses;
