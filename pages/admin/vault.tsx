import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { signOut } from "next-auth/client";
import { AuthenticatedUser, FormMetadataProperties } from "../../lib/types";
import { requireAuthentication } from "../../lib/auth";
import { Button } from "../../components/forms";

const AdminVault: React.FC = () => {
  const { t } = useTranslation("admin-vault");

  const [formID, setFormID] = useState("");
  const [responses, setResponses] = useState<ResponseListInterface>({ Items: [], Count: 0 });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(formID);
    fetchResponses(formID);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormID(event.target.value);
  };

  const fetchResponses = async (formID: string) => {
    await axios({
      url: "/api/retrieval",
      method: "POST",
      headers: {
        "Content-Type": "application/json ",
      },
      data: { formID, action: "GET" },
    }).then((response) => {
      setResponses(response.data);
    });
  };

  interface ResponseListInterface {
    Items: {
      FormSubmission: {
        S: string;
      };
      SubmissionID: {
        S: string;
      };
      FormID: {
        S: string;
      };
    }[];
    Count: number;
  }

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div>
        <h2 className="gc-h2">{t("subTitle")}:</h2>
      </div>
      <div>
        <form id="form" onSubmit={handleSubmit}>
          <label className={"gc-label"} htmlFor={"formTextInput"} id={"1"}>
            {t("formInput")}
          </label>
          <input
            className={"gc-input-text"}
            id={"formTextInput"}
            name="formTextInput"
            onChange={handleChange}
          />
          <div className="buttons">
            <Button className="gc-button" type="submit">
              {t("submitButton")}
            </Button>
          </div>
        </form>
        {responses.Count
          ? responses.Items.map((response) => {
              const submission = response.FormSubmission.S;
              const submissionID = response.SubmissionID.S;
              const formID = response.FormID.S;
              return (
                <div key={submissionID}>
                  <p>Submission: {submission}</p>
                  <p>SubmissionID: {submissionID}</p>
                  <p>For Form: {formID}</p>
                </div>
              );
            })
          : null}
      </div>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.locale) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-vault"])),
      },
    };
  }
  return { props: {} };
});

export default AdminVault;
