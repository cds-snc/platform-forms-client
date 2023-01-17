import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import { useTranslation } from "next-i18next";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import Link from "next/link";
import { HTMLDownloadFile } from "@components/myforms/HTMLDownload/HTMLDownloadFile";

//TODO download api path: /api/id/[form]/[submission]/download

//TODO ..
interface ResponsesProps {
  formResponse: any; //TODO
  confirmReceiptCode: string;
}

const Responses = ({ formResponse, confirmReceiptCode }: ResponsesProps) => {
  //const { t } = useTranslation(["my-forms"]);
  return (
    <>
      <h1>TODO: EVERYTHING HERE IS TEMP</h1>
      <h2>TODO: Download responses</h2>
      <p>
        <Link href="/api/id/clb3qek1w00288rkgmk9iqw9a/TODO/download">
          TODO: Test Mock response download
        </Link>
      </p>
      <hr className="mt-20" />
      <hr />
      EXAMPLE: MOCKED HTML DOWNLOAD FILE BELOW
      <hr />
      <hr className="mb-20" />
      {/* TODO: Probably must add all the HTML, Head and SkipLink etc..? If so, see BaseLayout */}
      {/* TODO: Do we want to embed images and css in file to be more self contained? */}
      <HTMLDownloadFile formResponse={formResponse} confirmReceiptCode={confirmReceiptCode} />
    </>
  );
};

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  {
    checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

    //TODO ..
    const formResponse = {
      // id: "cla7829dw0005f4kggctsrndu",
      responseNumber: "111111111111",
      submissionDate: new Date().toDateString(),
      questionsAnswersEn: {
        "Long Question":
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
        "1": "yes",
        "2": "Numero Uno",
        "3": ["Uno", "Dos", "Tres"],
        "4": "List item 1",
        "5": "1",
        "6": "111-111-1111",
        "7": "test@test.com",
        "8": "01/01/2001",
        "9": "2",
        "Question about questions":
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
        questionssss:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
      },
      questionsAnswersFr: {
        "Long Question[fr]":
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
        "1": "yes",
        "2": "Numero Uno",
        "3": ["Uno", "Dos", "Tres"],
        "4": "List item 1",
        "5": "1",
        "6": "111-111-1111",
        "7": "test@test.com",
        "8": "01/01/2001",
        "9": "2",
        "Question about questions":
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
        questionssss:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
      },
      titleEn: "Simple Form",
      titleFr: "Formulaire Simple",
    };

    //TODO ..
    const confirmReceiptCode = "123456789-TODO";

    return {
      props: {
        formResponse,
        confirmReceiptCode,
        ...(locale &&
          // Note: Important to send both EN and FR (intentional) for both response lang versions
          (await serverSideTranslations(locale, ["my-forms", "common"], null, ["en", "fr"]))),
      },
    };
  }
});

export default Responses;
