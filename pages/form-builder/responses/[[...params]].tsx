import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getFullTemplateByID } from "@lib/templates";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "@pages/_app";
import { PageTemplate, Template } from "@components/form-builder/app";
import { Button } from "@components/form-builder/app/shared";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import { GetServerSideProps } from "next";
import { FormRecord, VaultSubmissionList } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { checkOne } from "@lib/cache/flags";
import Link from "next/link";
import { Card } from "@components/globals/card/Card";
import { DownloadTable } from "@components/form-builder/app/DownloadTable/DownloadTable";
import { DownloadTableDialog } from "@components/form-builder/app/DownloadTable/DownloadTableDialog";
import { isFormId, isUUID } from "@lib/validation";

interface ResponsesProps {
  vaultSubmissions: VaultSubmissionList[];
  formId?: string;
}

const Responses: NextPageWithLayout<ResponsesProps> = ({
  vaultSubmissions,
  formId,
}: ResponsesProps) => {
  const { t } = useTranslation("form-builder-responses");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const MAX_CONFIRMATION_COUNT = 20;
  const MAX_REPORT_COUNT = 20;
  const [isShowConfirmReceiptDialog, setIsShowConfirmReceiptDialog] = useState(false);
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);

  const secondaryButtonClass =
    "whitespace-nowrap text-sm rounded-full bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500 py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500";

  return (
    <>
      <Head>
        <title>{t("responses.title")}</title>
      </Head>
      <PageTemplate title={t("responses.title")} autoWidth={true}>
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
            <div>
              {vaultSubmissions.length > 0 && (
                <DownloadTable vaultSubmissions={vaultSubmissions} formId={formId} />
              )}

              {vaultSubmissions.length <= 0 && (
                <Card
                  icon={
                    <picture>
                      <img src="/img/mailbox.png" width="193" height="200" alt="" />
                    </picture>
                  }
                  title={t("downloadResponsesTable.card.noResponses")}
                  content={t("downloadResponsesTable.card.noResponsesToDownload")}
                />
              )}
            </div>
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

      <DownloadTableDialog
        isShowDialog={isShowConfirmReceiptDialog}
        setIsShowDialog={setIsShowConfirmReceiptDialog}
        apiUrl={`/api/id/${formId}/submission/confirm`}
        inputRegex={isUUID}
        maxEntries={MAX_CONFIRMATION_COUNT}
        title={t("downloadResponsesModals.confirmReceiptDialog.title")}
        description={t("downloadResponsesModals.confirmReceiptDialog.findCode")}
        inputHelp={t("downloadResponsesModals.confirmReceiptDialog.copyCode", {
          max: MAX_CONFIRMATION_COUNT,
        })}
        nextSteps={t("downloadResponsesModals.confirmReceiptDialog.responsesAvailableFor")}
        submitButtonText={t("downloadResponsesModals.confirmReceiptDialog.confirmReceipt")}
      />

      <DownloadTableDialog
        isShowDialog={isShowReportProblemsDialog}
        setIsShowDialog={setIsShowReportProblemsDialog}
        apiUrl={`/api/id/${formId}/submission/report`}
        inputRegex={isFormId}
        maxEntries={MAX_REPORT_COUNT}
        title={t("downloadResponsesModals.reportProblemsDialog.title")}
        description={t("downloadResponsesModals.reportProblemsDialog.findForm")}
        inputHelp={t("downloadResponsesModals.reportProblemsDialog.enterFormNumbers", {
          max: MAX_REPORT_COUNT,
        })}
        nextSteps={t("downloadResponsesModals.reportProblemsDialog.problemReported")}
        submitButtonText={t("downloadResponsesModals.reportProblemsDialog.reportProblems")}
      />
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

  const session = await getServerSession(req, res, authOptions);

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
      const ability = createAbility(session);
      const [initialForm, submissions] = await Promise.all([
        getFullTemplateByID(ability, formID),
        listAllSubmissions(ability, formID),
      ]);
      FormbuilderParams.initialForm = initialForm;
      vaultSubmissions.push(...submissions);
    } catch (e) {
      if (e instanceof AccessControlError) {
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
      formId: FormbuilderParams.initialForm?.id ?? null,
      ...(locale &&
        (await serverSideTranslations(
          locale,
          ["common", "form-builder-responses", "form-builder"],
          null,
          ["fr", "en"]
        ))),
    },
  };
};

export default Responses;
