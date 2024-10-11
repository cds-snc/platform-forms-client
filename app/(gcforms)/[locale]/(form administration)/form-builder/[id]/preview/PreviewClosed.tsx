"use client";

import Brand from "@clientComponents/globals/Brand";
import { PreviewNavigation } from "./PreviewNavigation";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { defaultForm } from "@lib/store/defaults";
import { ClosedPage } from "@clientComponents/forms";
import { ClosedDetails, PublicFormRecord } from "@lib/types";
import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";
import { useIsFormClosed } from "@lib/hooks/useIsFormClosed";
import Skeleton from "react-loading-skeleton";

export const PreviewClosed = ({ closedDetails }: { closedDetails: ClosedDetails }) => {
  const { i18n } = useTranslation(["common", "confirmation"]);
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
    form: defaultForm,
    isPublished: getIsPublished(),
    securityAttribute: getSecurityAttribute(),
    closedDetails: closedDetails,
  };

  const brand = formRecord?.form ? formRecord.form.brand : null;

  const isPastClosingDate = useIsFormClosed();

  if (!isPastClosingDate) {
    // Force a hard refresh to the preview page if the form is not closed
    const refreshContent = `0;url=/${i18n.language}/form-builder/${id}/preview`;
    return (
      <>
        <meta httpEquiv="refresh" content={refreshContent} />
        <Skeleton count={4} height={40} className="mb-4" />
      </>
    );
  }

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
