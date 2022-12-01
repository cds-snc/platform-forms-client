import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LanguageToggle from "../../../globals/LanguageToggle";
import LoginMenu from "../../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "../../store";

import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { usePublish } from "../../hooks/usePublish";
import { useAllowPublish } from "../../hooks/useAllowPublish";
import { Button, withMessage } from "../../shared/Button";

export const Header = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
    email: s.submission?.email,
  }));

  const [isStartPage, setIsStartPage] = useState(false);
  const { isReady, asPath } = useRouter();
  const { status } = useSession();
  const { isSaveable } = useAllowPublish();
  const { ability } = useAccessControl();

  const { t, i18n } = useTranslation(["common", "form-builder"]);

  useEffect(() => {
    if (isReady) {
      const activePathname = new URL(asPath, location.href).pathname;
      if (activePathname === "/form-builder") {
        setIsStartPage(true);
      } else {
        setIsStartPage(false);
      }
    }
  }, [asPath, isReady]);

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
    <header className="border-b-3 border-blue-dark my-10 lg:px-4 xl:px-8 px-32">
      <div className="flex justify-between">
        <div>
          <Link href="/form-builder">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="inline-block mr-10 text-h2 mb-6 font-bold font-sans no-underline !text-black focus:bg-white !shadow-none">
              {t("title", { ns: "common" })}
            </a>
          </Link>
          {!isStartPage && isSaveable() && status === "authenticated" && (
            <ButtonWithMessage className="ml-4" onClick={handlePublish}>
              {t("save", { ns: "form-builder" })}
            </ButtonWithMessage>
          )}
        </div>
        <nav
          className="inline-flex gap-4"
          aria-label={t("mainNavAriaLabel", { ns: "form-builder" })}
        >
          <div className="md:text-small_base text-base font-normal not-italic">
            {ability?.can("view", "FormRecord") && (
              <Link href={`/${i18n.language}/myforms/drafts`}>
                {t("adminNav.myForms", { ns: "common" })}
              </Link>
            )}
          </div>
          {<LoginMenu isAuthenticated={status === "authenticated"} />}
          {<LanguageToggle />}
        </nav>
      </div>
    </header>
  );
};
