import React from "react";
import JSONUpload from "../../forms/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import Button from "../../forms/Button/Button";
import { useRouter } from "next/router";
import axios from "axios";

const handleDelete = async (formID: Int16Array) => {
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
    })
    .catch((err) => {
      console.error(err);
    });
  return resp;
};

const FormSettings = (props): React.ReactElement => {
  const { form } = props;
  const router = useRouter();
  const { t } = useTranslation("admin-templates");
  return (
    <>
      <h1 className="gc-h1">{t("settings.title")}</h1>
      <div>Form ID: {form.formID}</div>
      <h2>Edit Form Config File:</h2>
      <JSONUpload form={form}></JSONUpload>
      <br />
      <Button
        onClick={async () => {
          const resp = await handleDelete(form.formID);
          if (resp.status == 200)
            router.push({
              pathname: `/admin/view-templates`,
            });
        }}
        type="button"
      >
        {t("settings.delete")}
      </Button>
    </>
  );
};

export default FormSettings;
