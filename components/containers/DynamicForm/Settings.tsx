import React, { useState } from "react";
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

  const newText =
    router.query && router.query.newForm ? (
      <p className="gc-confirmation-banner">{t("settings.new")}</p>
    ) : (
      ""
    );

  const [deleteVisible, setDeleteVisible] = useState(false);

  const deleteButton = deleteVisible ? (
    <>
      <p>{t("settings.delete-check")}</p>
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
        testid="confirmDelete"
        type="button"
        destructive={true}
      >
        {t("settings.confirm-delete")}
      </Button>
    </>
  ) : (
    ""
  );

  return (
    <>
      <h1 className="gc-h1">{t("settings.title")}</h1>
      <div>{newText}</div>
      <div data-testid="formID" className="mb-4">
        Form ID: {form.formID}
      </div>
      <h2>Edit Form Config File:</h2>
      <JSONUpload form={form}></JSONUpload>
      <br />
      <div>
        <Button
          type="button"
          testid="delete"
          destructive={true}
          onClick={() => {
            setDeleteVisible(!deleteVisible);
          }}
        >
          {t("settings.delete")}
        </Button>
        <div>{deleteButton}</div>
      </div>
    </>
  );
};

export default FormSettings;
