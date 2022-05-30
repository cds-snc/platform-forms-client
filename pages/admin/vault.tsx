import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { getFormByID } from "@lib/integration/helpers";
import convertMessage from "@lib/markdown";
import { Button, RichText } from "../../components/forms";
import { logMessage } from "@lib/logger";
import { PublicFormRecord } from "@lib/types";

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
}

const FormResponse = ({
  Items,
  formSchema,
  fetchResponses,
}: ResponseListInterface & { formSchema?: PublicFormRecord } & {
  fetchResponses: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const [submissionArray, setSubmissionArray] = useState(Items);
  const [response, setResponse] = useState("");
  const [submissionID, setSubmissionID] = useState("");
  const [formID, setFormID] = useState("");
  const { t } = useTranslation("admin-vault");

  useEffect(() => {
    if (Items.length != submissionArray.length) {
      // allow "Look up responses" button to get updated numbers without a hard refresh
      setSubmissionArray(Items);
    }
  });

  const removeSubmission = async () => {
    if (submissionID) {
      await axios({
        url: "/api/retrieval",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json ",
        },
        data: { formID, responseID: submissionID },
      })
        .then(() => {
          if (submissionArray.length === 1) {
            // This is the last entry in the array.
            // Fetch more from server or show there are none left.
            fetchResponses();
          } else {
            setIndex((index) => (index === submissionArray.length - 1 ? index - 1 : index));
            setSubmissionArray((subArray) =>
              subArray.filter((item) => item.SubmissionID.S !== submissionID)
            );
          }
        })
        .catch((err) => {
          logMessage.error(err);
        });
    }
  };

  useEffect(() => {
    if (submissionArray.length > 0 && formSchema) {
      const submission = submissionArray[index];
      const responseJson = JSON.parse(submission.FormSubmission.S);
      const message = convertMessage({ form: formSchema, responses: responseJson });
      setResponse(message);
      setSubmissionID(submission.SubmissionID.S);
      setFormID(submission.FormID.S);
    }
  }, [index, submissionArray, formSchema]);

  useEffect(() => {
    setIndex(0);
    setSubmissionArray(Items);
  }, [formSchema, Items]);

  return (
    <>
      <div className="border-b-4">
        <div className="flex items-center">
          <div className="pl-4 flex-auto">
            <p>{`Response ${index + 1} of ${submissionArray.length}`}</p>
          </div>
          <div className="flex-auto">
            <Button
              className="gc-button rounded-lg float-right"
              type="button"
              onClick={removeSubmission}
            >
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
        {index > 0 && (
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
        )}

        {index < submissionArray.length - 1 && (
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
        )}
      </div>
    </>
  );
};
const AdminVault: React.FC = () => {
  const { t } = useTranslation("admin-vault");

  const [formID, setFormID] = useState("");
  const [formSchema, setFormSchema] = useState<PublicFormRecord | undefined>(undefined);
  const [responses, setResponses] = useState<ResponseListInterface>({ Items: [] });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    Promise.all([fetchResponses(), fetchForm()]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormID(event.target.value);
  };

  const fetchForm = async () => {
    await getFormByID(formID).then((form) => {
      form ? setFormSchema(form) : setFormSchema(undefined);
    });
  };

  const fetchResponses = async () => {
    if (formID) {
      await axios({
        url: "/api/retrieval",
        method: "GET",
        headers: {
          "Content-Type": "application/json ",
        },
        data: { formID },
      })
        .then((response) => {
          setResponses(response.data);
        })
        .catch((err) => {
          logMessage.error(err);
          setResponses({ Items: [] });
        });
    } else {
      setResponses({ Items: [] });
    }
  };

  const removeAllSubmissions = async () => {
    if (formID) {
      if (formID) {
        await axios({
          url: "/api/retrieval",
          method: "DELETE",
          headers: {
            "Content-Type": "application/json ",
          },
          data: { formID },
        })
          .then(() => {
            setResponses({ Items: [] });
          })
          .catch((err) => {
            logMessage.error(err);
            setResponses({ Items: [] });
          });
      } else {
        setResponses({ Items: [] });
      }
    }
  };

  const [deleteVisible, setDeleteVisible] = useState(false);

  const deleteButton = deleteVisible ? (
    <>
      <p>{t("confirmRemoveAll")}</p>
      <Button
        onClick={async () => {
          try {
            await removeAllSubmissions();
          } catch (e) {
            logMessage.error(e as Error);
          }
        }}
        testid="confirmDelete"
        type="button"
        destructive={true}
        className="rounded-lg"
      >
        {t("confirmRemoveAllButton")}
      </Button>
    </>
  ) : (
    ""
  );

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
          {responses.Items.length ? (
            <FormResponse {...responses} formSchema={formSchema} fetchResponses={fetchResponses} />
          ) : (
            <h3>{t("noResponse")}</h3>
          )}
        </div>
      </div>
      {responses.Items.length ? (
        <div className="mt-4 inline-block justify-left flex space-x-20">
          <Button
            className="gc-button rounded-lg"
            type="button"
            destructive={true}
            onClick={() => {
              setDeleteVisible(!deleteVisible);
            }}
          >
            {t("removeAllButton")}
          </Button>
          <div>{deleteButton}</div>
        </div>
      ) : (
        ""
      )}
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
