import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../lib/auth";
import { getFormByID } from "../../lib/dataLayer";
import convertMessage from "../../lib/markdown";
import { Button, RichText } from "../../components/forms";
import { PublicFormSchemaProperties } from "../../lib/types";

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
  formSchema?: PublicFormSchemaProperties;
}

const FormResponse = ({ Items, Count, formSchema }: ResponseListInterface) => {
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [submissionID, setSubmissionID] = useState("");

  const { t } = useTranslation("admin-vault");

  useEffect(() => {
    if (Items.length > 0 && formSchema) {
      const submission = Items[index];
      const responseJson = JSON.parse(submission.FormSubmission.S);
      const message = convertMessage({ form: formSchema, responses: responseJson });
      setResponse(message);
      setSubmissionID(submission.SubmissionID.S);
    }
  }, [index, Items, formSchema]);

  useEffect(() => {
    setIndex(0);
  }, [formSchema]);

  if (Count > 0) {
    return (
      <>
        <div className="border-b-4">
          <div className="flex items-center">
            <div className="pl-4 flex-auto">
              <p>{`Response ${index + 1} of ${Count}`}</p>
            </div>
            <div className="flex-auto">
              <Button className="gc-button rounded-lg float-right" type="button" onClick={() => {}}>
                {t("removeButton")}
              </Button>
            </div>
          </div>
          <p className="pl-4">{`Submission ID: ${submissionID}`}</p>{" "}
        </div>

        <div className="p-5">
          <RichText className="email-preview">{response}</RichText>
        </div>
        <div className="inline-block justify-center flex space-x-20">
          {index > 0 ? (
            <Button
              className="gc-button rounded-lg float-left"
              type="button"
              onClick={() => {
                const goTo = index - 1;

                setIndex(goTo >= 0 ? goTo : 0);
              }}
            >
              {t("backButton")}
            </Button>
          ) : null}

          {index < Count - 1 ? (
            <Button
              className="gc-button rounded-lg float-right"
              type="button"
              onClick={() => {
                const goTo = index + 1;

                setIndex(goTo >= 0 ? goTo : 0);
              }}
            >
              {t("nextButton")}
            </Button>
          ) : null}
        </div>
      </>
    );
  } else {
    return (
      <>
        <h3>{t("noResponse")}</h3>
      </>
    );
  }
};

const AdminVault: React.FC = () => {
  const { t } = useTranslation("admin-vault");

  const [formID, setFormID] = useState("");
  const [formSchema, setFormSchema] = useState<PublicFormSchemaProperties | undefined>(undefined);
  const [responses, setResponses] = useState<ResponseListInterface>({ Items: [], Count: 0 });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    Promise.all([fetchResponses(formID), fetchForm(formID)]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormID(event.target.value);
  };

  const fetchForm = async (formID: string) => {
    await getFormByID(formID).then((form) => {
      form ? setFormSchema(form) : setFormSchema(undefined);
    });
  };

  const fetchResponses = async (formID: string) => {
    if (formID) {
      await axios({
        url: "/api/retrieval",
        method: "POST",
        headers: {
          "Content-Type": "application/json ",
        },
        data: { formID, action: "GET" },
      })
        .then((response) => {
          setResponses(response.data);
        })
        .catch((err) => {
          console.error(err);
          setResponses({ Items: [], Count: 0 });
        });
    } else {
      setResponses({ Items: [], Count: 0 });
    }
  };

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
          <div className="inline-block space-x-3">
            <input
              className={"gc-input-text"}
              id={"formTextInput"}
              name="formTextInput"
              onChange={handleChange}
            />

            <Button className="gc-button rounded-lg " type="submit">
              {t("submitButton")}
            </Button>
          </div>
        </form>
      </div>
      <div className="border-4 rounded-lg border-black border-solid ">
        <div>
          <FormResponse {...responses} formSchema={formSchema} />
        </div>
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
