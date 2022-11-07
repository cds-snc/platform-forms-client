import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import React, { useCallback, useState } from "react";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { usePublish } from "../hooks/usePublish";
import { CancelIcon, CircleCheckIcon, WarningIcon, LockIcon } from "../icons";
import { Button } from "../shared/Button";
import { useNavigationStore } from "../store/useNavigationStore";
import { useRouter } from "next/router";

export const Publish = () => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const {
    userCanPublish,
    data: { title, questions, privacyPolicy, translate, responseDelivery, confirmationMessage },
    isPublishable,
  } = useAllowPublish();

  const [error, setError] = useState(false);

  const { getSchema, id, setId } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  const { setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="w-9 fill-green-700 inline-block" title={t("completed")} />
    ) : (
      <CancelIcon className="w-9 fill-red-700 w-9 h-9 inline-block" title={t("incomplete")} />
    );
  };

  const { uploadJson } = usePublish();

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id, true);
    if (result && result?.error) {
      setError(true);
      return;
    }

    setId(result?.id);
    setTab("published");
  };

  const handleSaveAndRequest = useCallback(async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id, false);
    if (result && result?.error) {
      setError(true);
      return;
    }

    router.push({ pathname: `/signup/unlock-publishing` });
  }, []);

  return (
    <>
      <h1 className="border-0 mb-0">{t("publishYourForm")}</h1>
      <p className="mb-0">{t("publishYourFormInstructions")}</p>
      {!userCanPublish && (
        <div className="mt-5 mb-5 p-5 bg-purple-200 flex">
          <div className="flex">
            <div className="pr-7">
              <LockIcon className="mb-2 scale-125" />
            </div>
          </div>
          <div>
            <h3 className="mb-1">Unlock publishing</h3>
            <p className="mb-5">
              To unlock publishing, provide the contact information of the person you report to.
            </p>
            <p>
              <Button theme="secondary" onClick={handleSaveAndRequest}>
                Save form and request publishing ability
              </Button>
            </p>
          </div>
        </div>
      )}

      <ul className="list-none p-0">
        <li className="mb-4 mt-4">
          <Icon checked={title} /> {t("formTitle")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={questions} /> {t("questions")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={privacyPolicy} /> {t("privacyStatement")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={confirmationMessage} /> {t("formConfirmationMessage")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={translate} /> {t("translate")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={responseDelivery} /> {t("responseDelivery")}
        </li>
      </ul>

      {userCanPublish && (
        <div className="mt-10 p-5 bg-yellow-100 flex">
          <div className="flex">
            <div className="pr-7">
              <WarningIcon />
            </div>
          </div>
          <div>
            <h3 className="mb-1">Publishing disables editing.</h3>
            <p>
              Once you publish, you cannot make changes to this form. If changes are needed after
              publishing, use the form file to create and publish a new form.
            </p>
            <p>
              <a href="https://canada.ca">Contact support</a> if you have any questions.
            </p>
          </div>
        </div>
      )}
      {isPublishable() && (
        <>
          <Button className="mt-5" onClick={handlePublish}>
            {t("publish")}
          </Button>
          <div
            role="alert"
            className={`inline-block ml-5 py-1 px-3 
            ${error ? "text-red-destructive bg-red-100" : ""}
            ${id ? "text-green-darker bg-green-100" : ""} 
            ${!id && !error ? "hidden" : ""}`}
          >
            <>{error && <p>There was an error publishing the form</p>}</>
          </div>
        </>
      )}
    </>
  );
};
