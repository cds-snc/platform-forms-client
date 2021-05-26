import React from "react";
import JSONUpload from "../../forms/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import Button from "../../forms/Button/Button";
import { useRouter } from "next/router";
import axios from "axios";
import { FormDBConfigProperties } from "../../../lib/types";

interface FormSettingsProps {
  form: FormDBConfigProperties;
}

const handleDelete = async (formID: number) => {
  // redirect to view templates page on success
  const resp = await axios({
    url: "/api/templates",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      method: "DELETE",
      formID: formID,
    },
    timeout: 0,
  })
    .then((serverResponse) => {
      //success - redirect to view-templates page
      console.log(serverResponse);
      return serverResponse;
    })
    .catch((err) => {
      console.error(err);
      return err;
    });
  return resp.status;
};

export const FormSettings = (props: FormSettingsProps): React.ReactElement => {
  const { form } = props;
  const router = useRouter();
  const { t } = useTranslation("admin-templates");
  return (
    <>
      <h1 className="gc-h1">{t("settings.title")}</h1>
      <div data-testid="formID">Form ID: {form.formID}</div>
      <h2>Edit Form Config File:</h2>
      <JSONUpload form={form}></JSONUpload>
      <br />
      <Button
        onClick={async () => {
          try {
            const resp = await handleDelete(form.formID);
            if (resp == 200) {
              router.push({
                pathname: `/admin/view-templates`,
              });
            } else {
              console.error(JSON.stringify(resp));
            }
          } catch (e) {
            console.error(e);
          }
        }}
        testid="delete"
        type="button"
      >
        {t("settings.delete")}
      </Button>
    </>
  );
};

export default FormSettings;
