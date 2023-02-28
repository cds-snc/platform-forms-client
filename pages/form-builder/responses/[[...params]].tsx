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
    // Note: Need to clone and set so React change detection notices a change in the Map
    setCheckedItems(
      new Map(
        checkedItems.set(id, {
          checked: checked,
          name: checkedItems.get(id)?.name ?? "",
        })
      )
    );
  };

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
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
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

  // TODO: User will need to click "allow" for the multiple file download dialog, maybe want to add
  // a note in the UI
  const handleDownload = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    const downloads = getCheckedItemsList().map((item) => {
      const url = `/api/id/${formId}/${item.name}/download`;
      const fileName = item.name;
      return downloadFile(url, fileName);
    });

    await Promise.all(downloads)
      .catch((err) => {
        logMessage.error(err as Error);
        setErrorMessage("TODO Error downloading selected files.");
      })
      .finally(() => {
        setIsSubmitting(false);
        setErrorMessage("");
        // TODO: update Download Response Table with updated download responses
      });
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
            <div>
              {vaultSubmissions?.length > 0 && (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Select</th>
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
                        {vaultSubmissions.map((submission, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                id={submission.name}
                                className="gc-input-checkbox__input"
                                name="responses"
                                type="checkbox"
                                checked={checkedItems.get(submission.name)?.checked}
                                onChange={handleChecked}
                              />
                            </td>
                            <td>
                              <label htmlFor={submission.name}>{submission.name}</label>
                            </td>
                            <td>{submission.status}</td>
                            <td></td>
                            <td></td>
                            <td>
                              {submission.status === "Confirmed" ? "Confirmed" : "Confirm By XXXX"}
                            </td>
                            <td>Not Set</td>
                          </tr>
                        ))}
                      </>
                    </tbody>
                  </table>
                  <div>
                    <button className="gc-button" type="button" onClick={handleDownload}>
                      Download {getCheckedItemsList().length} selected responses
                    </button>
                  </div>
                  {isSubmitting && <h2>TODO Downloading</h2>}
                  {errorMessage && <h2>TODO {errorMessage}</h2>}
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
