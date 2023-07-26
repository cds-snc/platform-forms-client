import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getFullTemplateByID } from "@lib/templates";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "@pages/_app";
import { PageTemplate, Template } from "@components/form-builder/app";
import { GetServerSideProps } from "next";
import { FormRecord, VaultSubmissionList } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@components/globals/card/Card";
import { DownloadTable } from "@components/form-builder/app/responses/DownloadTable";
import { DownloadTableDialog } from "@components/form-builder/app/responses/DownloadTableDialog";
import { isFormId, isUUID } from "@lib/validation";
import { NagwareResult } from "@lib/types";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { Nagware } from "@components/form-builder/app/Nagware";
import { EmailResponseSettings } from "@components/form-builder/app/shared";
import { useTemplateStore } from "@components/form-builder/store";
import { LoggedOutTabName, LoggedOutTab } from "@components/form-builder/app/LoggedOutTab";

interface ResponsesProps {
  vaultSubmissions: VaultSubmissionList[];
  formId?: string;
  nagwareResult: NagwareResult | null;
}

// TODO: move to an app setting variable
const MAX_CONFIRMATION_COUNT = 20;
const MAX_REPORT_COUNT = 20;

const Responses: NextPageWithLayout<ResponsesProps> = ({
  vaultSubmissions,
  formId,
  nagwareResult,
}: ResponsesProps) => {
  const { t } = useTranslation("form-builder-responses");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isShowConfirmReceiptDialog, setIsShowConfirmReceiptDialog] = useState(false);
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);

  const { getDeliveryOption, isPublished } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
    isPublished: s.isPublished,
  }));

  const deliveryOption = getDeliveryOption();

  const navItemClasses =
    "no-underline !shadow-none border-black border-1 rounded-[100px] pt-1 pb-2 laptop:py-2 px-5 mr-3 mb-0 text-black visited:text-black focus:bg-[#475569] hover:bg-[#475569] hover:!text-white focus:!text-white [&_svg]:focus:fill-white";

  if (!isAuthenticated) {
    return (
      <>
        <PageTemplate title={t("responses.title")}>
          <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
        </PageTemplate>
      </>
    );
  }

  if (deliveryOption && deliveryOption.emailAddress) {
    return (
      <>
        <PageTemplate title={t("responses.email.title")} autoWidth={true}>
          <div className="flex flex-wrap items-baseline mb-8">
            <h1 className="border-none mb-0 tablet:mb-4 tablet:mr-8">
              {isAuthenticated ? t("responses.email.title") : t("responses.unauthenticated.title")}
            </h1>
            <nav className="flex gap-3">
              {!isPublished && (
                <Link href="/form-builder/settings" legacyBehavior>
                  <a href="/form-builder/settings" className={`${navItemClasses}`}>
                    {t("responses.changeSetup")}
                  </a>
                </Link>
              )}
            </nav>
          </div>
          <EmailResponseSettings
            emailAddress={deliveryOption.emailAddress}
            subjectEn={deliveryOption.emailSubjectEn || ""}
            subjectFr={deliveryOption.emailSubjectFr || ""}
          />
        </PageTemplate>
      </>
    );
  }

  return (
    <>
      <PageTemplate title={t("responses.title")} autoWidth={true}>
        <div className="flex flex-wrap items-baseline mb-8">
          <h1 className="border-none mb-0 tablet:mb-4 tablet:mr-8">
            {isAuthenticated ? t("responses.title") : t("responses.unauthenticated.title")}
          </h1>

          <nav className="flex flex-wrap gap-3">
            {isAuthenticated && (
              <button
                onClick={() => setIsShowConfirmReceiptDialog(true)}
                className={navItemClasses}
                disabled={status !== "authenticated"}
              >
                {t("responses.confirmReceipt")}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setIsShowReportProblemsDialog(true)}
                className={navItemClasses}
                disabled={status !== "authenticated"}
              >
                {t("responses.reportProblems")}
              </button>
            )}

            {!isPublished && (
              <Link href="/form-builder/settings" legacyBehavior>
                <a href="/form-builder/settings" className={`${navItemClasses}`}>
                  {t("responses.changeSetup")}
                </a>
              </Link>
            )}
          </nav>
        </div>

        {nagwareResult && <Nagware nagwareResult={nagwareResult} />}

        {isAuthenticated && (
          <>
            <div>
              {vaultSubmissions.length > 0 && (
                <DownloadTable
                  vaultSubmissions={vaultSubmissions}
                  formId={formId}
                  nagwareResult={nagwareResult}
                />
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

      {isShowConfirmReceiptDialog && (
        <DownloadTableDialog
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
          minEntriesErrorTitle={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.minEntries.title"
          )}
          minEntriesErrorDescription={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.minEntries.description"
          )}
          maxEntriesErrorTitle={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.maxEntries.title",
            {
              max: MAX_CONFIRMATION_COUNT,
            }
          )}
          maxEntriesErrorDescription={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.maxEntries.description",
            {
              max: MAX_CONFIRMATION_COUNT,
            }
          )}
          errorEntriesErrorTitle={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.errorEntries.title"
          )}
          errorEntriesErrorDescription={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.errorEntries.description"
          )}
          invalidEntryErrorTitle={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.title"
          )}
          invalidEntryErrorDescription={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.description"
          )}
          unknownErrorTitle={t("downloadResponsesModals.confirmReceiptDialog.errors.unknown.title")}
          unknownErrorDescription={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.unknown.description"
          )}
          unknownErrorDescriptionLink={t(
            "downloadResponsesModals.confirmReceiptDialog.errors.unknown.descriptionLink"
          )}
        />
      )}

      {isShowReportProblemsDialog && (
        <DownloadTableDialog
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
          minEntriesErrorTitle={t(
            "downloadResponsesModals.reportProblemsDialog.errors.minEntries.title"
          )}
          minEntriesErrorDescription={t(
            "downloadResponsesModals.reportProblemsDialog.errors.minEntries.description"
          )}
          maxEntriesErrorTitle={t(
            "downloadResponsesModals.reportProblemsDialog.errors.maxEntries.title",
            {
              max: MAX_REPORT_COUNT,
            }
          )}
          maxEntriesErrorDescription={t(
            "downloadResponsesModals.reportProblemsDialog.errors.maxEntries.description",
            {
              max: MAX_REPORT_COUNT,
            }
          )}
          errorEntriesErrorTitle={t(
            "downloadResponsesModals.reportProblemsDialog.errors.errorEntries.title"
          )}
          errorEntriesErrorDescription={t(
            "downloadResponsesModals.reportProblemsDialog.errors.errorEntries.description"
          )}
          invalidEntryErrorTitle={t(
            "downloadResponsesModals.reportProblemsDialog.errors.invalidEntry.title"
          )}
          invalidEntryErrorDescription={t(
            "downloadResponsesModals.reportProblemsDialog.errors.invalidEntry.description"
          )}
          unknownErrorTitle={t("downloadResponsesModals.reportProblemsDialog.errors.unknown.title")}
          unknownErrorDescription={t(
            "downloadResponsesModals.reportProblemsDialog.errors.unknown.description"
          )}
          unknownErrorDescriptionLink={t(
            "downloadResponsesModals.reportProblemsDialog.errors.unknown.descriptionLink"
          )}
        />
      )}
    </>
  );
};

Responses.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export const getServerSideProps: GetServerSideProps = async ({
  query: { params },
  locale,
  req,
  res,
}) => {
  const [formID = null] = params || [];

  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale: locale || "en",
  };

  const vaultSubmissions: VaultSubmissionList[] = [];
  let nagwareResult: NagwareResult | null = null;

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

  if (session && !session.user.securityQuestions.length) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/setup-security-questions`,
        permanent: false,
      },
    };
  }

  if (formID && session) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        return {
          redirect: {
            // We can redirect to a 'Form does not exist page' in the future
            destination: `/${locale}/404`,
            permanent: false,
          },
        };
      }

      const allSubmissions = await listAllSubmissions(ability, formID);

      FormbuilderParams.initialForm = initialForm;
      vaultSubmissions.push(...allSubmissions.submissions);

      nagwareResult = allSubmissions.submissions.length
        ? await detectOldUnprocessedSubmissions(allSubmissions.submissions)
        : null;
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
      nagwareResult,
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
