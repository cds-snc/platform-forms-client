"use client";

import Brand from "@clientComponents/globals/Brand";
import { PreviewNavigation } from "./PreviewNavigation";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { defaultForm } from "@lib/store/defaults";
import { ClosedPage } from "@clientComponents/forms";
import { ClosedDetails, PublicFormRecord } from "@lib/types";
import { useSession } from "next-auth/react";

export const PreviewClosed = ({ closedDetails }: { closedDetails: ClosedDetails }) => {
  const { status } = useSession();
  const { id, getIsPublished, getSecurityAttribute } = useTemplateStore((s) => ({
    id: s.id,
    getIsPublished: s.getIsPublished,
    getSecurityAttribute: s.getSecurityAttribute,
  }));

  const { translationLanguagePriority, getLocalizationAttribute } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const language = translationLanguagePriority;

  const formRecord: PublicFormRecord = {
    id: id || "test0form00000id000asdf11",
    // TODO: refactor code to handle invalid JSON and show a helpful error message. Above will
    // show a toast to download the JSON file. But it's the default template so it will be valid
    // JSON and hide the invalid JSON that failed to parse.
    form: defaultForm,
    isPublished: getIsPublished(),
    securityAttribute: getSecurityAttribute(),
    closedDetails: closedDetails,
  };

  const brand = formRecord?.form ? formRecord.form.brand : null;

  return (
    <div className="max-w-4xl">
      <PreviewNavigation />
      <div className="h-12"></div>
      <div
        className={`mb-8 border-3 border-dashed border-blue-focus bg-white p-4 ${
          status !== "authenticated" && ""
        }`}
        {...getLocalizationAttribute()}
      >
        <div className="gc-formview">
          <div className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
            <Brand brand={brand} lang={language} className="max-w-[360px]" />
          </div>
          <ClosedPage language={language} formRecord={formRecord} />
        </div>
      </div>
    </div>
  );
};
