import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { requireAuthentication } from "../../../lib/auth";

import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Label, TextInput, Button } from "@components/forms";
import { Formik, Form } from "formik";
import { logMessage } from "@lib/logger";

export const CreateOrganization = (): React.ReactElement => {
  const { t } = useTranslation("organizations");

  return (
    <>
      <Head>{t("createTitle")}</Head>

      <h1 className="gc-h1">{t("createTitle")}</h1>
      <Formik
        initialValues={{ orgNameEn: "", orgNameFr: "" }}
        onSubmit={async (values) => {
          return await axios({
            url: "/api/organizations",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              method: "INSERT",
              organizationNameEn: values.orgNameEn,
              organizationNameFr: values.orgNameFr,
            },
            timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
          })
            .then((serverResponse) => {
              return serverResponse;
            })
            .catch((err) => {
              logMessage.error(err);
            });
        }}
      >
        <Form>
          <Label htmlFor="orgNameEn" required={true}>
            Organization Name (English)
          </Label>
          <TextInput
            id="orgNameEn"
            name="orgNameEn"
            type="text"
            label="Organization Name"
            required={true}
            characterCountMessages={{
              part1: t("formElements.characterCount.part1"),
              part2: t("formElements.characterCount.part2"),
              part1Error: t("formElements.characterCount.part1-error"),
              part2Error: t("formElements.characterCount.part2-error"),
            }}
          />
          <Label htmlFor="orgNameFr" required={true}>
            Organization Name (French)
          </Label>
          <TextInput
            id="orgNameFr"
            name="orgNameFr"
            type="text"
            label="Nom de Organization"
            required={true}
            characterCountMessages={{
              part1: t("formElements.characterCount.part1"),
              part2: t("formElements.characterCount.part2"),
              part1Error: t("formElements.characterCount.part1-error"),
              part2Error: t("formElements.characterCount.part2-error"),
            }}
          />
          <Button type="submit">Submit</Button>
        </Form>
      </Formik>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context && context.locale ? context.locale : "", [
        "common",
        "organizations",
      ])),
    }, // will be passed to the page component as props
  };
});

export default CreateOrganization;
