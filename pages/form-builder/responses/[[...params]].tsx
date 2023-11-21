import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getFullTemplateByID } from "@lib/templates";
import { getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "@pages/_app";
import { GetServerSideProps } from "next";
import { FormRecord, VaultStatus, VaultSubmissionList } from "@lib/types";
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
import { Button, ErrorPanel } from "@components/globals";
import { ClosedBanner } from "@components/form-builder/app/shared/ClosedBanner";
import { getAppSetting } from "@lib/appSettings";
import { Close, DeleteIcon, FolderIcon, InboxIcon } from "@components/form-builder/icons";
import { SubNavLink } from "@components/form-builder/app/navigation/SubNavLink";
import { useRouter } from "next/router";
import Image from "next/image";

interface ResponsesProps {
  vaultSubmissions: VaultSubmissionList[];
  formId: string;
  nagwareResult: NagwareResult | null;
  responseDownloadLimit: number;
}

// TODO: move to an app setting variable
const MAX_REPORT_COUNT = 20;

const Responses: NextPageWithLayout<ResponsesProps> = ({
  vaultSubmissions,
  formId,
  nagwareResult,
  responseDownloadLimit,
}: ResponsesProps) => {
  const { t } = useTranslation("form-builder-responses");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isShowConfirmReceiptDialog, setIsShowConfirmReceiptDialog] = useState(false);
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);

  const [isServerError, setIsServerError] = useState(false);

  const router = useRouter();
  const [, statusQuery = "new"] = router.query.params || [];

  const { getDeliveryOption, isPublished } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
    isPublished: s.isPublished,
  }));

  const deliveryOption = getDeliveryOption();

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
        <div className="mb-8 flex flex-wrap items-baseline">
          <h1 className="mb-0 border-none tablet:mb-4">
            {isAuthenticated ? t("responses.email.title") : t("responses.unauthenticated.title")}
          </h1>
          <nav className="flex gap-3">
            {!isPublished && (
              <Link href="/form-builder/settings" legacyBehavior>
                <a
                  href="/form-builder/settings"
                  className="mb-0 mr-3 rounded-[100px] border-1 border-black px-5 pb-2 pt-1 text-black no-underline !shadow-none visited:text-black hover:bg-[#475569] hover:!text-white focus:bg-[#475569] focus:!text-white laptop:py-2 [&_svg]:focus:fill-white"
                >
                  {t("responses.changeSetup")}
                </a>
              </Link>
            )}
          </nav>
        </div>
        <ClosedBanner id={formId} />
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
        <div className="mb-8 flex flex-wrap items-baseline">
          <h1 className="mb-0 border-none tablet:mb-4 tablet:mr-8">{t("responses.title")}</h1>
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

      <h1 className="mb-0 border-none tablet:mb-4 tablet:mr-8">
        {isAuthenticated ? t("responses.title") : t("responses.unauthenticated.title")}
      </h1>

      <nav className="my-8 flex relative" aria-label={t("responses.navLabel")}>
        <SubNavLink
          id="new-responses"
          defaultActive={statusQuery === "new"}
          href={`/form-builder/responses/${formId}/new`}
          setAriaCurrent={true}
        >
          <span className="text-sm laptop:text-base">
            <InboxIcon className="inline-block h-7 w-7" /> {t("responses.status.new")}
          </span>
        </SubNavLink>
        <SubNavLink
          id="downloaded-responses"
          href={`/form-builder/responses/${formId}/downloaded`}
          setAriaCurrent={true}
        >
          <span className="text-sm laptop:text-base">
            <FolderIcon className="inline-block h-7 w-7" /> {t("responses.status.downloaded")}
          </span>
        </SubNavLink>
        <SubNavLink
          id="deleted-responses"
          href={`/form-builder/responses/${formId}/confirmed`}
          setAriaCurrent={true}
        >
          <span className="text-sm laptop:text-base">
            <DeleteIcon className="inline-block h-7 w-7" /> {t("responses.status.deleted")}
          </span>
        </SubNavLink>
        <div className="absolute right-0">
          {isAuthenticated && statusQuery === "downloaded" && (
            <Button
              onClick={() => setIsShowConfirmReceiptDialog(true)}
              theme="destructive"
              className="float-right"
              disabled={status !== "authenticated"}
              icon={<Close className="fill-white" />}
            >
              {t("responses.confirmReceipt")}
            </Button>
          )}
        </div>
      </nav>

      {nagwareResult && <Nagware nagwareResult={nagwareResult} />}

      {isAuthenticated && (
        <>
          <div aria-live="polite">
            <ClosedBanner id={formId} />
            {vaultSubmissions.length > 0 && (
              <DownloadTable
                vaultSubmissions={vaultSubmissions}
                formId={formId}
                nagwareResult={nagwareResult}
                responseDownloadLimit={responseDownloadLimit}
              />
            )}

            {vaultSubmissions.length <= 0 && statusQuery === "new" && (
              <Card
                icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                title={t("downloadResponsesTable.card.noNewResponses")}
                content={t("downloadResponsesTable.card.noNewResponsesMessage")}
              />
            )}

            {vaultSubmissions.length <= 0 && statusQuery === "downloaded" && (
              <Card
                icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                title={t("downloadResponsesTable.card.noDownloadedResponses")}
                content={t("downloadResponsesTable.card.noDownloadedResponsesMessage")}
              />
            )}

            {vaultSubmissions.length <= 0 && statusQuery === "confirmed" && (
              <Card
                icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                title={t("downloadResponsesTable.card.noDeletedResponses")}
                content={t("downloadResponsesTable.card.noDeletedResponsesMessage")}
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
        maxEntries={responseDownloadLimit}
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
  const [formID = null, statusQuery = "new"] = params || [];

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

      const ucfirst = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };

      // get status from url params (default = new) and capitalize/cast to VaultStatus
      const status = ucfirst(String(statusQuery)) as VaultStatus;

      const allSubmissions = await listAllSubmissions(ability, formID, status);

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

  const responseDownloadLimit = Number(await getAppSetting("responseDownloadLimit"));

  return {
    props: {
      ...FormbuilderParams,
      vaultSubmissions,
      formId: FormbuilderParams.initialForm?.id ?? null,
      responseDownloadLimit: responseDownloadLimit,
      nagwareResult,
      ...(locale &&
        (await serverSideTranslations(
          locale,
          ["common", "form-builder-responses", "form-builder", "form-closed"],
          null,
          ["fr", "en"]
        ))),
    },
  };
};

export default Responses;
