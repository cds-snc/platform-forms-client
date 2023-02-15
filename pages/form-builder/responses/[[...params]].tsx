import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getFullTemplateByID } from "@lib/templates";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "@pages/_app";
import { PageTemplate, Template } from "@components/form-builder/app";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import { GetServerSideProps } from "next";
import { FormRecord, VaultSubmissionList } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { logMessage } from "@lib/logger";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { checkOne } from "@lib/cache/flags";
import Link from "next/link";
import { isUUID, isFormId } from "@lib/validation";

interface ResponsesProps {
  vaultSubmissions: VaultSubmissionList[];
}

const Responses: NextPageWithLayout<ResponsesProps> = ({ vaultSubmissions }: ResponsesProps) => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const secondaryButtonClass =
    "whitespace-nowrap text-sm rounded-full bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500 py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500";

  // Dialog: Confirm Code vars
  const [codes, setCodes] = useState<string[]>([]);
  const validateCodes = (code: string) => {
    return isUUID(code);
  };
  const dialogConfirmReceipt = useDialogRef();
  const dialogConfirmReceiptInstructionId =
    "dialog-confirm-receipt-instruction-" + Math.random().toString(36).substr(2, 9);
  const [isShowConfirmReceiptDialog, setIsShowConfirmReceiptDialog] = useState(false);
  const dialogConfirmReceiptHandleClose = () => {
    setIsShowConfirmReceiptDialog(false);
    dialogConfirmReceipt.current?.close();
  };
  const handleConfirmReceiptSubmit = () => {
    //TODO
  };

  // Dialog: Report Problems vars
  const [formNumbers, setFormNumbers] = useState<string[]>([]);
  const validateFormNumber = (formId: string) => {
    return isFormId(formId);
  };
  const dialogReportProblems = useDialogRef();
  const dialogReportProblemsInstructionId =
    "dialog-report-problems-instruction-" + Math.random().toString(36).substr(2, 9);
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);
  const dialogReportProblemsHandleClose = () => {
    setIsShowReportProblemsDialog(false);
    dialogReportProblems.current?.close();
  };
  const handleReportProblemSubmit = () => {
    //TODO
  };

  return (
    <>
      <Head>
        <title>{t("responses.title")}</title>
      </Head>
      <PageTemplate title={t("responses.title")}>
        <div className="flex justify-between items-baseline">
          <h1 className="text-2xl border-none font-normal">
            {isAuthenticated ? t("responses.title") : t("responses.unauthenticated.title")}
          </h1>
          <nav className="flex gap-3">
            {isAuthenticated && (
              <Button
                onClick={() => setIsShowConfirmReceiptDialog(true)}
                className="text-sm rounded-full"
                theme="secondary"
                disabled={status !== "authenticated"}
              >
                {t("responses.confirmReceipt")}
              </Button>
            )}

            {isAuthenticated && (
              <Button
                onClick={() => setIsShowReportProblemsDialog(true)}
                theme="secondary"
                className="text-sm rounded-full"
                disabled={status !== "authenticated"}
              >
                {t("responses.reportProblems")}
              </Button>
            )}

            <StyledLink
              href="/form-builder/settings"
              className={`text-sm no-underline ${secondaryButtonClass} rounded-full`}
            >
              {t("responses.changeSetup")}
            </StyledLink>
          </nav>
        </div>

        {isAuthenticated && (
          <>
            <div className="border-2 border-solid border-black">
              <table>
                <thead>
                  <tr>
                    <th>Response ID</th>
                    <th>Status</th>
                    <th>Download Response</th>
                    <th>Last Downloaded By</th>
                    <th>Confirm Receipt</th>
                    <th>Removal</th>
                  </tr>
                </thead>
                <tbody>
                  <>
                    {vaultSubmissions?.length > 0 ? (
                      vaultSubmissions.map((submission, index) => (
                        <tr key={index}>
                          <td>{submission.name}</td>
                          <td>{submission.status}</td>
                          <td></td>
                          <td></td>
                          <td>{submission.retrieved ? "Confirmed" : "Confirm By XXXX"}</td>
                          <td>Not Set</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr key="1">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Not Set</td>
                        </tr>
                        <tr key="2">
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Not Set</td>
                        </tr>
                      </>
                    )}
                  </>
                </tbody>
              </table>
            </div>
            <div>TODO download button here</div>
          </>
        )}

        {!isAuthenticated && (
          <>
            <p>
              {t("responses.unauthenticated.toAccessPagePart1")}{" "}
              <Link href={"/auth/login"}>{t("responses.unauthenticated.signIn")}</Link>{" "}
              {t("responses.unauthenticated.toAccessPagePart2")}
            </p>
            <p className="mt-8">
              {t("responses.unauthenticated.noAccount")}{" "}
              <Link href={"/signup/register"}>{t("responses.unauthenticated.createOne")}</Link>.
            </p>
          </>
        )}
      </PageTemplate>

      {isShowConfirmReceiptDialog && (
        <Dialog
          title={t("responses.confirmReceiptDialog.title")}
          dialogRef={dialogConfirmReceipt}
          handleClose={dialogConfirmReceiptHandleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10 py-4">
            <p className="mb-8">{t("responses.confirmReceiptDialog.findCode")}</p>
            <p className="mt-20 mb-2 font-bold" id={dialogConfirmReceiptInstructionId}>
              {t("responses.confirmReceiptDialog.copyCode")}
            </p>
            <LineItemEntries
              inputs={codes}
              setInputs={setCodes}
              validateInput={validateCodes}
              spellCheck={false}
              inputLabelId={dialogConfirmReceiptInstructionId}
            ></LineItemEntries>
            <p className="mt-8">{t("responses.confirmReceiptDialog.responsesAvailableFor")}</p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleConfirmReceiptSubmit}>
                {t("responses.confirmReceipt")}
              </Button>
              <Button theme="secondary" onClick={dialogConfirmReceiptHandleClose}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {isShowReportProblemsDialog && (
        <Dialog
          title={t("responses.reportProblemsDialog.title")}
          dialogRef={dialogReportProblems}
          handleClose={dialogReportProblemsHandleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10 py-4">
            <p className="mb-8">{t("responses.reportProblemsDialog.findForm")}</p>
            <p id={dialogReportProblemsInstructionId} className="mt-20 mb-2 font-bold">
              {t("responses.reportProblemsDialog.enterFormNumbers")}
            </p>
            <LineItemEntries
              inputs={formNumbers}
              setInputs={setFormNumbers}
              validateInput={validateFormNumber}
              spellCheck={false}
              inputLabelId={dialogReportProblemsInstructionId}
            ></LineItemEntries>
            <p className="mt-8">{t("responses.reportProblemsDialog.problemReported")}</p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleReportProblemSubmit}>
                {t("responses.reportProblemsDialog.reportProblems")}
              </Button>
              <Button theme="secondary" onClick={dialogReportProblemsHandleClose}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

Responses.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export const getServerSideProps: GetServerSideProps = async ({
  query: { params },
  locale,
  req,
  res,
}) => {
  const [formID = null] = params || [];
  const vault = await checkOne("vault");

  if (!vault) {
    return {
      redirect: {
        destination: `/${locale}/404`,
        permanent: false,
      },
    };
  }

  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale: locale || "en",
  };

  const vaultSubmissions: VaultSubmissionList[] = [];

  const session = await unstable_getServerSession(req, res, authOptions);

  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  if (formID && session) {
    try {
      const ability = createAbility(session.user.privileges);
      const [initialForm, submissions] = await Promise.all([
        getFullTemplateByID(ability, formID),
        listAllSubmissions(ability, formID),
      ]);
      FormbuilderParams.initialForm = initialForm;
      vaultSubmissions.push(...submissions);
    } catch (e) {
      if (e instanceof AccessControlError) {
        logMessage.info(
          `NOT AUTHORIZED: User ${session.user.id} attempted to access form responses for form ID ${formID}`
        );
        return {
          redirect: {
            destination: `/${locale}/admin/unauthorized`,
            permanent: false,
          },
        };
      }
    }
  }

  return {
    props: {
      ...FormbuilderParams,
      vaultSubmissions,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder"], null, ["fr", "en"]))),
    },
  };
};

export default Responses;
