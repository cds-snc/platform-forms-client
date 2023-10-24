import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getFullTemplateByID } from "@lib/templates";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "@pages/_app";
import { GetServerSideProps } from "next";
import { FormRecord, VaultSubmissionList } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@components/globals/card/Card";
import { DownloadTable } from "@components/form-builder/app/responses/DownloadTable";
import { ConfirmDialog } from "@components/form-builder/app/responses/Dialogs/ConfirmDialog";
import { ReportDialog } from "@components/form-builder/app/responses/Dialogs/ReportDialog";
import { NagwareResult } from "@lib/types";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { Nagware } from "@components/form-builder/app/Nagware";
import { EmailResponseSettings } from "@components/form-builder/app/shared";
import { useTemplateStore } from "@components/form-builder/store";
import { LoggedOutTabName, LoggedOutTab } from "@components/form-builder/app/LoggedOutTab";
import Head from "next/head";
import { FormBuilderLayout } from "@components/globals/layouts/FormBuilderLayout";
import { ErrorPanel } from "@components/globals";
import { PageHeading } from "@components/globals/PageHeading";

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
  const [isServerError, setIsServerError] = useState(false);

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
        <Head>
          <title>{t("responses.title")}</title>
        </Head>
        <div className="max-w-4xl">
          <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
        </div>
      </>
    );
  }

  if (deliveryOption && deliveryOption.emailAddress) {
    return (
      <>
        <Head>
          <title>{t("responses.email.title")}</title>
        </Head>
        <div className="flex flex-wrap items-baseline mb-8">
          {/* <h1 className="border-none mb-0 tablet:mb-4 tablet:mr-8" id="pageHeading" tabIndex={-1}>
            
          </h1> */}
          <PageHeading>
            {isAuthenticated ? t("responses.email.title") : t("responses.unauthenticated.title")}
          </PageHeading>
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
      </>
    );
  }

  if (isServerError) {
    return (
      <>
        <Head>
          <title>{t("responses.title")}</title>
        </Head>
        <div className="flex flex-wrap items-baseline mb-8">
          {/* <h1 className="border-none mb-0 tablet:mb-4 tablet:mr-8">{t("responses.title")}</h1> */}
          <PageHeading>{t("responses.title")}</PageHeading>
          <ErrorPanel supportLink={false}>{t("server-error", { ns: "common" })}</ErrorPanel>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t("responses.title")}</title>
      </Head>
      <div className="flex flex-wrap items-baseline mb-8">
        {/* <h1 className="border-none mb-0 tablet:mb-4 tablet:mr-8">
          {isAuthenticated ? t("responses.title") : t("responses.unauthenticated.title")}
        </h1> */}
        <PageHeading>
          {isAuthenticated ? t("responses.title") : t("responses.unauthenticated.title")}
        </PageHeading>

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

      <ConfirmDialog
        isShow={isShowConfirmReceiptDialog}
        setIsShow={setIsShowConfirmReceiptDialog}
        apiUrl={`/api/id/${formId}/submission/confirm`}
        maxEntries={MAX_CONFIRMATION_COUNT}
      />

      <ReportDialog
        isShow={isShowReportProblemsDialog}
        setIsShow={setIsShowReportProblemsDialog}
        setIsServerError={setIsServerError}
        apiUrl={`/api/id/${formId}/submission/report`}
        maxEntries={MAX_REPORT_COUNT}
      />
    </>
  );
};

Responses.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout page={page} />;
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

  if (session && !session.user.hasSecurityQuestions) {
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
