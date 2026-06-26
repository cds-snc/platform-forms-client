import React from "react";
import { serverTranslation } from "@i18n/server";
import { I18n } from "@i18n";
import { Metadata } from "next";

import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { Footer } from "@root/components/serverComponents/globals/Footer/Footer";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
import { languages } from "@i18n/settings";
import { cookies } from "next/headers";
import { Language } from "@lib/types/form-builder-types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation("error");
  return {
    title: t("404.title"),
  };
}

export default async function NotFound() {
  const { t } = await serverTranslation(["error"]);

  const locale = (await cookies()).get("i18next")?.value ?? languages[0];

  return (
    <div className="flex h-full flex-col">
      <GcdsHeader pathname="" showLanguageToggle={false} language={locale as Language} />
      <div id="page-container">
        <main id="content">
          <div className="mt-10">
            <ErrorPanel headingTag="h1" title={t("404.title")}>
              <p>
                <I18n i18nKey="404.body" namespace="error" />
              </p>
            </ErrorPanel>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
