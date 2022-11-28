import React from "react";
import { useTemplateStore } from "../store";
import LanguageToggle from "../../globals/LanguageToggle";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import { useNavigationStore } from "../store/useNavigationStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { usePublish } from "../hooks/usePublish";
import { Button, withMessage } from "../shared/Button";
import { useRouter } from "next/router";

export const Header = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
    email: s.submission?.email,
  }));

  const router = useRouter();
  const { status } = useSession();
  const { isSaveable } = useAllowPublish();
  const { ability } = useAccessControl();
  const { currentTab, setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const { t } = useTranslation(["common", "form-builder"]);

  const handleClick = () => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab("start");
      router.push({ pathname: `/form-builder` });
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

  const ButtonWithMessage = withMessage(Button, t("saveDraftMessage", { ns: "form-builder" }));

  return (
    <header className="border-b-3 border-blue-dark my-10">
      <div className="flex justify-between">
        <div>
          <button
            type="button"
            onClick={handleClick()}
            className="inline-block mr-10 text-h2 mb-6 font-bold font-sans"
          >
            {t("title", { ns: "common" })}
          </button>
          {currentTab !== "start" && isSaveable() && status === "authenticated" && (
            <ButtonWithMessage className="ml-4" onClick={handlePublish}>
              {t("save", { ns: "form-builder" })}
            </ButtonWithMessage>
          )}
        </div>
        <div className="inline-flex gap-4">
          <div className="md:text-small_base text-base font-normal not-italic">
            {ability?.can("view", "FormRecord") && (
              <Link href="/myforms/drafts">{t("adminNav.myForms", { ns: "common" })}</Link>
            )}
          </div>
          {<LoginMenu isAuthenticated={status === "authenticated"} />}
          {<LanguageToggle />}
        </div>
      </div>
    </header>
  );
};
