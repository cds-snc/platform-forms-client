import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import LanguageToggle from "../../globals/LanguageToggle";
import { DownloadFileButton } from "./DownloadFileButton";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import { useNavigationStore } from "../store/useNavigationStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { usePublish } from "../hooks/usePublish";
import { Button, withMessage } from "../shared/Button";

export const Header = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
    email: s.submission.email,
  }));

  const { status } = useSession();
  const { isSaveable } = useAllowPublish();
  const { ability } = useAccessControl();
  const currentTab = useNavigationStore((s) => s.currentTab);
  const setTab = useNavigationStore((s) => s.setTab);
  const { t } = useTranslation(["common", "form-builder"]);

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
    };
  };

  const { uploadJson } = usePublish();

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);

    if (result?.id) {
      setId(result?.id);
    }
  };

  const ButtonWithMessage = withMessage(Button, t("saveDraftMessage"));
  const DownloadFileButtonWithMessage = withMessage(DownloadFileButton, t("saveDownloadMessage"));

  return (
    <header className="border-b-3 border-blue-dark my-10">
      <div className="flex justify-between">
        <div>
          <button
            type="button"
            onClick={handleClick("start")}
            className="inline-block mr-10 text-h2 mb-6 font-bold font-sans"
          >
            {t("title")}
          </button>
          {currentTab !== "start" &&
            isSaveable() &&
            (status === "authenticated" ? (
              <ButtonWithMessage className="ml-4" onClick={handlePublish}>
                {t("save")}
              </ButtonWithMessage>
            ) : (
              <DownloadFileButtonWithMessage className="!py-1 !px-4" />
            ))}
        </div>
        <div className="inline-flex gap-4">
          <div className="md:text-small_base text-base font-normal not-italic">
            {ability?.can("view", "FormRecord") && (
              <Link href="/myforms">{t("adminNav.myForms", { ns: "common" })}</Link>
            )}
          </div>
          {<LoginMenu isAuthenticated={status === "authenticated"} />}
          {<LanguageToggle />}
        </div>
      </div>
    </header>
  );
};
