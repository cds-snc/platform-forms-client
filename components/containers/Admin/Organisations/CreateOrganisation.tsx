import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Label, TextInput, Button } from "@components/forms";
import { Formik, Form } from "formik";

export const CreateOrganisation = (): React.ReactElement => {
  const { t } = useTranslation("organisations");

  return (
    <>
      <Head>{t("createTitle")}</Head>

      <h1 className="gc-h1">{t("createTitle")}</h1>
      <Formik
        initialValues={{ orgNameEn: "", orgNameFr: "" }}
        onSubmit={async (values) => {
          console.log(values);
          return await axios({
            url: "/api/organisations",
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: {
              method: "INSERT",
              organisationNameEn: values.orgNameEn,
              organisationNameFr: values.orgNameFr,
            },
            timeout: 0,
          })
            .then((serverResponse) => {
              return serverResponse;
            })
            .catch((err) => {
              console.error(err);
            });
        }}
      >
        <Form>
          <Label htmlFor="orgNameEn" required={true}>
            Organisation Name (English)
          </Label>
          <TextInput id="orgNameEn" name="orgNameEn" type="text" required={true}></TextInput>
          <Label htmlFor="orgNameFr" required={true}>
            Organisation Name (French)
          </Label>
          <TextInput id="orgNameFr" name="orgNameFr" type="text" required={true}></TextInput>
          <Button type="submit">Submit</Button>
        </Form>
      </Formik>
    </>
  );
};

export default CreateOrganisation;
