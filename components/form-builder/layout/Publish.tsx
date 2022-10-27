import { useTranslation } from "next-i18next";
import axios from "axios";
import useTemplateStore from "../store/useTemplateStore";
import React, { useCallback } from "react";
import { CheckCircleOutline } from "@styled-icons/material/CheckCircleOutline";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { CancelIcon } from "../icons";
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
    } catch (e) {
      // console.log(e);
    }
  };

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CheckCircleOutline className="w-9 fill-green-700 inline-block" />
    ) : (
      <CancelIcon className="w-9 fill-red-700 w-9 h-9 inline-block" />
    );
  };

  const handlePublish = useCallback(async () => {
    await uploadJson(getSchema());
  }, []);

  return (
    <>
      <h1 className="border-0 mb-0">{t("publishYourForm")}</h1>
      <p>{t("publishYourFormInstructions")}</p>

      <ul className="list-none p-0">
        <li className="mb-4 mt-8">
          <Icon checked={title} /> Publisher
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={questions} /> Questions
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={privacyPolicy} /> Privacy statement
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={translate} /> Translate
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={responseDelivery} /> Response delivery
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={title} /> Form title
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={confirmationMessage} /> Form confirmation message
        </li>
      </ul>

      <p className="leading-10 mt-8">
        <Link href={""}>Why do I need to have these before publishing?</Link>
        <br />
        <Link href={""}>How do I get the authority to publish?</Link>
        <br />
        <Link href={""}>Support</Link>
      </p>
      {isPublishable() && <PrimaryButton onClick={handlePublish}>Publish</PrimaryButton>}
    </>
  );
};
