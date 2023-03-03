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
import axios from "axios";
import { useRouter } from "next/router";
import { ExclamationIcon } from "@components/form-builder/icons";

/*
  TEMP example JSON response
  {
    "formID":"cldx7r73j0034wdkgkyq2wgrv",
    "status":"New",
    "securityAttribute":"Unclassified",
    "name":"27-02-3689",
    "createdAt":1677530856944,
    "lastDownloadedBy":"peter.thiessen@cds-snc.ca"
  }
  Missing
  -Removal column, "In X days", how compute this? From confirmTimestamp
  -download date ("Download Response column" DD/MM/YYYY)
  -Status for "Downloaded" ("Status" column, vault JSON not updating after downloading a file and reloading)
*/

// TODO: User will need to click "allow" for the multiple file download dialog, maybe want to add
// a note in the UI

// TODO: performance test
// -computations may be a problem so do inline per row (user will at least some row by row even if lag)
// -could try a "spinner" while rendering if lagging

// NOTE: browsers have different limits for simultaneous downloads. May need to look into
// batching file downloads (e.g. 4 at a time) if edge cases/* come up.
// e.g. Max simultaneous downloade: Chrome 5-6, Safari 4, Edge no limit (10k?), FF 5-7

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
  const DOWNLOAD_OVERDUE = 15;
  const CONFIRM_OVERDUE = 15;

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

  // Note: Map chosen for get/set performance, though with the cloning "gymnastics" below a simple
  // object hash may be faster. Come back to if performance is ever an issue.
  const submissionNames = new Map(
    vaultSubmissions.map((submission) => [
      submission.name,
      {
        // formId: submission.formID,
        name: submission.name,
        checked: false,
      },
    ])
  );
  const [checkedItems, setCheckedItems] = useState(submissionNames);

  const handleChecked = (e) => {
    const id = e.target.id;
    const checked: boolean = e.target.checked;
    // Note: Needed to clone and set so React change detection notices a change in the Map
    setCheckedItems(
      new Map(
        checkedItems.set(id, {
          checked: checked,
          name: checkedItems.get(id)?.name ?? "",
        })
      )
    );
  };

  // TODO refactor/cleanup this function up, kind of smells..
  const getCheckedItemsList = () => {
    const checked = [];
    checkedItems.forEach((item) => {
      if (item?.checked) checked.push(item);
    });
    return checked;
  };

  // Note: A hack to enable an ajax file download through axios. Oddly setting the responseType
  // is not enough. Come back to this, suspect there is a better way..
  const forceFileDownload = (response: any, fileName: string) => {
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

  const handleDownload = async () => {
    if (getCheckedItemsList().length > MAX_FILE_DOWNLOADS) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const downloads = getCheckedItemsList().map((item) => {
      const url = `/api/id/${formId}/${item.name}/download`;
      const fileName = item.name;
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

  function getDaysPassed(date: Date): number {
    const dateCreated = new Date(date);
    const dateToday = new Date();
    const dateDiff = Math.abs(Number(dateToday) - Number(dateCreated));
    const daysPassed = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
    return daysPassed;
  }

  // Format date for: DD/MM/YYYY
  function formatDate(date: Date): string {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).length <= 2 ? `0${dateObj.getDate()}` : dateObj.getDate();
    const month =
      String(dateObj.getMonth()).length <= 2
        ? `0${dateObj.getMonth() + 1}`
        : dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatStatus(vaultStatus: string) {
    switch (vaultStatus) {
      case "New":
        return <span className="p-2 bg-[#ecf3eb] text-[#0c6722]">New</span>;
      case "Downloaded":
        return <span className="p-2 bg-[#dcd6fe]">Downloaded</span>;
      case "Confirmed":
        return <span className="p-2 bg-[#e2e8ef]">Confirmed</span>;
      case "Problem":
        return <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">Problem</span>;
      default:
        return <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">Unknown</span>;
    }
  }

  function formatDownloadResponse({
    vaultStatus,
    createdAt,
    downloadedAt,
  }: {
    vaultStatus: string;
    createdAt?: Date;
    downloadedAt?: Date;
  }) {
    if (vaultStatus === "New" && createdAt) {
      const daysPassed = getDaysPassed(createdAt);
      const daysLeft = DOWNLOAD_OVERDUE - daysPassed;
      if (daysLeft > 0) {
        return `Within ${daysLeft} days`;
      }
      return (
        // TODO: probably move to an Exclamation component
        <div className="flex items-center">
          <ExclamationIcon className="mr-1" />
          <span className="font-bold text-[#bc3332]">Overdue</span>
        </div>
      );
    }

    if (
      (vaultStatus === "Downloaded" || vaultStatus === "Confirmed" || vaultStatus === "Problem") &&
      downloadedAt
    ) {
      return formatDate(downloadedAt);
    }

    return "Unknown";
  }

  function formatConfirmReceipt({
    vaultStatus,
    createdAtDate,
  }: {
    vaultStatus: string;
    createdAtDate: Date;
  }) {
    switch (vaultStatus) {
      case "New":
        return "Unconfirmed";
      case "Confirmed":
        return "Done";
      case "Problem":
        return <span className="p-2 bg-[#f3e9e8] text-[#bc3332] font-bold">Problem</span>;
      case "Downloaded": {
        const daysPassed = getDaysPassed(createdAtDate);
        const daysLeft = CONFIRM_OVERDUE - daysPassed;
        if (daysLeft > 0) {
          return `Within ${daysLeft} days`;
        }
        return (
          <div className="flex items-center">
            <ExclamationIcon className="mr-1" />
            <span className="font-bold text-[#bc3332]">Overdue</span>
          </div>
        );
      }
      default:
        return "Unknown";
    }
  }

  function formatRemoval({ vaultStatus, removedAt }: { vaultStatus: string; removedAt?: Date }) {
    //TODO: if days <= 0, maybe "Removed" or something?
    if (vaultStatus === "Confirmed" && removedAt) {
      const days = getDaysPassed(removedAt);
      return `Within ${days} days`;
    }

    if (vaultStatus === "Problem") {
      return "Won't Remove";
    }

    if (vaultStatus === "New" || vaultStatus === "Downloaded") {
      return "Not set";
    }

    return "Unknown";
  }

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
                  <div>
                    <table className="text-sm">
                      <thead className="border-b-2 border-[#6a6d7b]">
                        <tr>
                          <th className="p-4  text-center">Select</th>
                          <th className="p-4 text-left">Number</th>
                          <th className="p-4 text-left">Status</th>
                          <th className="p-4 text-left whitespace-nowrap">Download Response</th>
                          <th className="p-4 text-left whitespace-nowrap">Last Downloaded By</th>
                          <th className="p-4 text-left whitespace-nowrap">Confirm Receipt</th>
                          <th className="p-4 text-left">Removal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <>
                          {vaultSubmissions.map((submission, index) => (
                            <tr
                              key={index}
                              className={
                                "border-b-2 border-grey" +
                                (checkedItems.get(submission.name)?.checked ? " bg-[#fffbf3]" : "")
                              }
                            >
                              <td className="p-4 flex">
                                {/* TODO 
                                    Replace below with Design System checkbox 
                                */}
                                <div className="form-builder">
                                  <div className="multiple-choice-wrapper">
                                    <input
                                      id={submission.name}
                                      className="multiple-choice-wrapper"
                                      name="responses"
                                      type="checkbox"
                                      checked={checkedItems.get(submission.name)?.checked}
                                      onChange={handleChecked}
                                    />
                                    <label htmlFor={submission.name}>
                                      <span className="sr-only">{submission.name}</span>
                                    </label>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 whitespace-nowrap">{submission.name}</td>
                              <td className="p-4 ">{formatStatus(submission.status)}</td>
                              <td className="p-4 ">
                                {formatDownloadResponse({
                                  vaultStatus: submission.status,
                                  createdAt: submission.createdAt,
                                  downloadedAt: submission.downloadedAt,
                                })}
                              </td>
                              <td className="p-4">
                                <div className="truncate w-48">
                                  {submission.lastDownloadedBy || "Not downloaded"}
                                </div>
                              </td>
                              <td className="p-4 ">
                                {formatConfirmReceipt({
                                  vaultStatus: submission.status,
                                  createdAtDate: submission.createdAt,
                                })}
                              </td>
                              <td className="p-4 ">
                                {formatRemoval({
                                  vaultStatus: submission.status,
                                  removedAt: submission.removedAt,
                                })}
                              </td>
                            </tr>
                          ))}
                        </>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8">
                    <button
                      className="gc-button whitespace-nowrap w-auto"
                      type="button"
                      onClick={handleDownload}
                    >
                      Download {getCheckedItemsList().length} selected responses{" "}
                      {getCheckedItemsList().length > MAX_FILE_DOWNLOADS
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
