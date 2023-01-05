import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import React, { useCallback, useState } from "react";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { usePublish } from "../hooks/usePublish";
import { CancelIcon, CircleCheckIcon, WarningIcon, LockIcon } from "../icons";
import { Button } from "./shared/Button";
import { useRouter } from "next/router";
import { PublishNoAuth } from "./PublishNoAuth";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";

export const Publish = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
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
    router.push({ pathname: `/form-builder/published` });
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

    router.push({ pathname: `/unlock-publishing` });
  }, [getSchema, id, uploadJson, router]);

  if (status !== "authenticated") {
    return <PublishNoAuth />;
  }

  return (
    <>
      <h1 className="border-0 mb-0 md:text-h1">{t("publishYourForm")}</h1>
      <p className="mb-0">{t("publishYourFormInstructions")}</p>
      {!userCanPublish && (
        <div className="mt-5 mb-5 p-5 bg-purple-200 flex">
          <div className="flex">
            <div className="pr-7">
              <LockIcon className="mb-2 scale-125" />
            </div>
          </div>
          <div>
            <h3 className="mb-1">{t("unlockPublishing")}</h3>
            <p className="mb-5">{t("unlockPublishingDescription")}</p>
            <p>
              <Button theme="secondary" onClick={handleSaveAndRequest}>
                {t("saveAndRequest")}
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

      {userCanPublish && isPublishable() && (
        <>
          <div className="mt-10 p-5 bg-yellow-100 flex">
            <div className="flex">
              <div className="pr-7">
                <WarningIcon />
              </div>
            </div>
            <div>
              <h2 className="mb-1 text-h3 pb-0 mb-0">{t("publishingDisablesEditing")}</h2>
              <p>{t("publishingDisablesEditingDescription")}</p>
              <Markdown options={{ forceBlock: true }}>
                {t("contactSupportIfYouHaveQuestions")}
              </Markdown>
            </div>
          </div>
          <Button className="mt-5" onClick={handlePublish}>
            {t("publish")}
          </Button>
          <div
            role="alert"
            className={`inline-block ml-5 py-1 px-3 
            ${error ? "text-red-destructive bg-red-100" : ""}
            ${!error ? "hidden" : ""}`}
          >
            <>{error && <p>{t("thereWasAnErrorPublishing")}</p>}</>
          </div>
        </>
      )}
    </>
  );
};
