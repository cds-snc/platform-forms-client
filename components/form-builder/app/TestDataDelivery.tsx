import React, { useState, useEffect } from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { usePublish } from "../hooks/usePublish";
import { useTranslation } from "next-i18next";
import { Button } from "./shared/Button";
import { LocalizedFormProperties } from "../types";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { RocketIcon } from "../icons/RocketIcon";
import { Form } from "@components/forms";

export const TestDataDelivery = () => {
  const { status } = useSession();
  const { localizeField, getSchema, id, setId, email, getLocalizationAttribute } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      getSchema: s.getSchema,
      id: s.id,
      setId: s.setId,
      email: s.submission?.email,
      getLocalizationAttribute: s.getLocalizationAttribute,
    })
  );
  const stringified = getSchema();

  const formRecord = {
    id: id || "test0form00000id000asdf11",
    ...JSON.parse(stringified),
  };

  const router = useRouter();
  const { t: t1 } = useTranslation("");
  const { t, i18n } = useTranslation("form-builder");
  const language = i18n.language as string;
  const currentForm = getRenderedForm(formRecord, language, t);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState<string | null>();

  const { uploadJson } = usePublish();

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);
    if (result && result?.error) {
      setError(true);
    }

    setId(result?.id);
  };

  useEffect(() => {
    if (status !== "authenticated") {
      router.push("/form-builder/edit");
    }
  }, [status, router]);

  return status === "authenticated" ? (
    <div>
      <h1 className="border-0 mb-0 md:text-h1">{t("testYourResponseDelivery")}</h1>
      <div className="mb-8 bg-blue-200 p-5">
        {t("submittedResponsesText", { email })}{" "}
        <Link
          href="#"
          legacyBehavior={false}
          className="text-underline inline"
          onClick={(e) => {
            e.preventDefault();
            router.push({ pathname: `/form-builder/settings` });
          }}
        >
          {t("updateResponseDestination")}
        </Link>
      </div>

      <p>{t("toTestInstructions")}</p>
      <ol className="ml-5 mb-8 mt-6">
        {!id && (
          <li className="mb-4">
            {t("saveYourForm")}
            <Button theme="secondary" className="ml-4" onClick={handlePublish}>
              {t("save")}
            </Button>
            <div
              role="alert"
              className={`inline-block ml-5 py-1 px-3 text-red-destructive bg-red-100 ${
                error ? "" : "hidden"
              }`}
            >
              <p>{t("thereWasAnErrorSaving")}</p>
            </div>
          </li>
        )}
        <li>{t("fillFormClickSubmit")}</li>
      </ol>
      <div
        className="border-3 border-dashed border-blue-focus p-4 mb-8"
        {...getLocalizationAttribute()}
      >
        <h1>{formRecord.form[localizeField(LocalizedFormProperties.TITLE)]}</h1>
        {sent ? (
          <div className="p-7 mb-10 flex bg-green-50">
            <div className="flex">
              <div className="flex p-7">
                <RocketIcon className="block self-center" />
              </div>
            </div>
            <div>
              <h2 className="mb-1 pb-0"> {t("dataDeliveredTitle")}</h2>
              <p className="mb-5 mt-0">{t("dataDeliveredMessage")}</p>
            </div>
          </div>
        ) : (
          <Form
            formRecord={formRecord}
            language={language}
            router={router}
            t={t1}
            renderSubmit={(submitButton) => (
              <>
                <span {...getLocalizationAttribute()}>{submitButton}</span>
                <div
                  className="inline-block py-1 px-4 bg-purple-200"
                  {...getLocalizationAttribute()}
                >
                  {t("submitToTestDataDelivery")}
                </div>
              </>
            )}
            onSuccess={setSent}
          >
            {currentForm}
          </Form>
        )}
      </div>
    </div>
  ) : null;
};
