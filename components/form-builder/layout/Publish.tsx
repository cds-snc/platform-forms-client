import { useTranslation } from "next-i18next";
import axios from "axios";
import useTemplateStore from "../store/useTemplateStore";
import React, { useCallback, useState } from "react";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { CancelIcon, CircleCheckIcon } from "../icons";
import styled from "styled-components";
import { FancyButton } from "../panel/Button";
import Link from "next/link";

const PrimaryButton = styled(FancyButton)`
  margin-top: 25px;
  padding: 10px 15px;
  background: #26374a;
  box-shadow: inset 0 -2px 0 #515963;
  color: white;

  &:hover:not(:disabled),
  &:active,
  &:focus {
    color: #ffffff;
    background: #1c578a;
    box-shadow: inset 0 -2px 0 #7a8796;
  }

  &:hover:active {
    background: #16446c;
  }
`;

export const Publish = () => {
  const { t } = useTranslation("form-builder");
  const {
    data: { title, questions, privacyPolicy, translate, responseDelivery, confirmationMessage },
    isPublishable,
  } = useAllowPublish();

  const [formId, setFormId] = useState(undefined);
  const [error, setError] = useState(false);

  const { getSchema } = useTemplateStore();

  const uploadJson = async (jsonConfig: string, formID?: string) => {
    try {
      const result = await axios({
        url: "/api/templates",
        method: formID ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          formConfig: JSON.parse(jsonConfig),
          formID: formID,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      return { id: result?.data?.id };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="w-9 fill-green-700 inline-block" title={t("completed")} />
    ) : (
      <CancelIcon className="w-9 fill-red-700 w-9 h-9 inline-block" title={t("incomplete")} />
    );
  };

  const handlePublish = useCallback(async () => {
    setError(false);
    const result = await uploadJson(getSchema(), formId);
    if (!result?.id) {
      setError(true);
      return;
    }
    setFormId(result?.id);
  }, [setError, setFormId]);

  return (
    <>
      <h1 className="border-0 mb-0">{t("publishYourForm")}</h1>
      <p>{t("publishYourFormInstructions")}</p>

      <ul className="list-none p-0">
        <li className="mb-4 mt-8">
          <Icon checked={title} /> {t("publisher")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={questions} /> {t("questions")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={privacyPolicy} /> {t("privacyStatement")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={translate} /> {t("translate")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={responseDelivery} /> {t("responseDelivery")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={title} /> {t("formTitle")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={confirmationMessage} /> {t("formConfirmationMessage")}
        </li>
      </ul>

      <p className="leading-10 mt-8">
        <Link href={""}>Why do I need to have these before publishing?</Link>
        <br />
        <Link href={""}>How do I get the authority to publish?</Link>
        <br />
        <Link href={""}>Support</Link>
      </p>
      {isPublishable() && (
        <>
          <PrimaryButton onClick={handlePublish}>{t("publish")}</PrimaryButton>

          <div
            role="alert"
            className={`inline-block ml-5 py-1 px-3 
            ${error ? "text-red-destructive bg-red-100" : ""}
            ${formId ? "text-green-darker bg-green-100" : ""} 
            ${!formId && !error ? "hidden" : ""}`}
          >
            {formId && <p>The form has been published successfully</p>}
            {error && <p>There was an error publishing the form</p>}
          </div>
        </>
      )}
    </>
  );
};
