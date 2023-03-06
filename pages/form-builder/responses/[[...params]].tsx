import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getFullTemplateByID } from "@lib/templates";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "@pages/_app";
import { PageTemplate, Template } from "@components/form-builder/app";
import { Button, useDialogRef, Dialog } from "@components/form-builder/app/shared";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import { GetServerSideProps } from "next";
import { FormRecord, VaultSubmissionList } from "@lib/types";
import { listAllSubmissions } from "@lib/vault";
import { logMessage } from "@lib/logger";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { checkOne } from "@lib/cache/flags";
import Link from "next/link";
import { Card } from "@components/globals/card/Card";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { DownloadTable } from "@components/form-builder/app/DownloadTable";
import { HttpResponse } from "@aws-sdk/types";

// TODO: User will need to click "allow" for the multiple file download dialog, add to UI?
// TODO: could try a "spinner" while rendering, especially for lots of rows

interface ResponsesProps {
  vaultSubmissions: VaultSubmissionList[];
}

const Responses: NextPageWithLayout<ResponsesProps> = ({ vaultSubmissions }: ResponsesProps) => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
  const router = useRouter();
  const { params } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false); // TODO
  const [errorMessage, setErrorMessage] = useState(""); // TODO
  const formId = params && params.length && params[0];
  const isAuthenticated = status === "authenticated";
  const MAX_FILE_DOWNLOADS = 20;

  // Note: Map chosen for get/set performance, though with the cloning "gymnastics" below a simple
  // object hash may be faster. Come back to if performance is ever an issue.
  const [checkedItems, setCheckedItems] = useState(
    new Map(vaultSubmissions.map((submission) => [submission.name, false]))
  );

  const secondaryButtonClass =
    "whitespace-nowrap text-sm rounded-full bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500 py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500";

  const dialogConfirmReceipt = useDialogRef();
  const [isShowConfirmReceiptDialog, setIsShowConfirmReceiptDialog] = useState(false);
  const dialogConfirmReceiptHandleClose = () => {
    setIsShowConfirmReceiptDialog(false);
    dialogConfirmReceipt.current?.close();
  };

  const dialogReportProblems = useDialogRef();
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);
  const dialogReportProblemsHandleClose = () => {
    setIsShowReportProblemsDialog(false);
    dialogReportProblems.current?.close();
  };
  const buttonActionsReportProblems = (
    <Button onClick={dialogReportProblemsHandleClose}>{t("responses.reportProblems")}</Button>
  );

  const getCheckedItemsList = () => {
    const checkedMap = new Map();
    checkedItems.forEach((checked, name) => {
      if (checked) {
        checkedMap.set(name, checked);
      }
    });
    return checkedMap;
  };

  // Note: A hack to enable an ajax file download through axios. Oddly setting the responseType
  // is not enough. Come back to this, suspect there is a better way..
  const forceFileDownload = (response: AxiosResponse<any, any>, fileName: string) => {
    try {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      logMessage.error(`Error: browser failed to start file downloaded for file ${fileName}`);
    }
  };

  const downloadFile = async (url: string, submissionName: string) => {
    return await axios({
      url: url,
      method: "GET",
      responseType: "blob",
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    }).then((response) => {
      forceFileDownload(response, `${submissionName}.html`);
      // return submissionName;
    });
  };

  // NOTE: browsers have different limits for simultaneous downloads. May need to look into
  // batching file downloads (e.g. 4 at a time) if edge cases/* come up.
  // e.g. Max simultaneous downloade: Chrome 5-6, Safari 4, Edge no limit (10k?), FF 5-7
  const handleDownload = async () => {
    if (getCheckedItemsList().size > MAX_FILE_DOWNLOADS) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const downloads = Array.from(getCheckedItemsList(), (item) => {
      const url = `/api/id/${formId}/${item[0]}/download`;
      const fileName = item[0];
      return downloadFile(url, fileName);
    });

    await Promise.all(downloads)
      .then(() => {
        // TODO: setErrorMessage("");

        // Refreshes getServersideProps data without a page re-load
        router.replace(router.asPath);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setErrorMessage("TODO Error downloading selected files.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

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
              {vaultSubmissions?.length > 0 && (
                <>
                  <DownloadTable
                    vaultSubmissions={vaultSubmissions}
                    checkedItems={checkedItems}
                    setCheckedItems={setCheckedItems}
                  />
                  <div className="mt-8">
                    <button
                      className="gc-button whitespace-nowrap w-auto"
                      type="button"
                      onClick={handleDownload}
                    >
                      Download {getCheckedItemsList().size} selected responses{" "}
                      {getCheckedItemsList().size > MAX_FILE_DOWNLOADS
                        ? `(Max ${MAX_FILE_DOWNLOADS})`
                        : ""}
                    </button>
                  </div>

                  {/* TODO Add a spinner or something */}
                  {isSubmitting && <div>Downloading...</div>}

                  {/* TODO Add a toast message or something */}
                  {errorMessage && <div>{errorMessage}</div>}
                </>
              )}

              {vaultSubmissions?.length <= 0 && (
                <Card
                  icon={
                    <picture>
                      <img src="/img/mailbox.png" width="193" height="200" alt="" />
                    </picture>
                  }
                  title={"You have no responses"}
                  content={"There are no responses available to download."}
                ></Card>
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
        <Dialog
          title="Confirm receipt of responses"
          dialogRef={dialogConfirmReceipt}
          handleClose={dialogConfirmReceiptHandleClose}
        >
          <>
            <p>TODO</p>
          </>
        </Dialog>
      )}

      {isShowReportProblemsDialog && (
        <Dialog
          title="Report problems with responses"
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

  //TEMP
  logMessage.info("------------\n" + JSON.stringify(vaultSubmissions));

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
