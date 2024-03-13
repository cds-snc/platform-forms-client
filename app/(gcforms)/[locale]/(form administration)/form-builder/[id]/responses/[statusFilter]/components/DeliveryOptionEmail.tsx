import React from "react";
import Link from "next/link";
import { EmailResponseSettings } from "@formBuilder/components/shared";
import { ClosedBanner } from "@formBuilder/components/shared/ClosedBanner";
import { serverTranslation } from "@i18n";

export const DeliveryOptionEmail = async ({
  email,
  emailSubject,
  isPublished,
  formId,
}: {
  email: string;
  emailSubject: { en: string; fr: string };
  isPublished: boolean;
  formId: string;
}) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("form-builder-responses");

  return (
    <>
      <div className="mb-8 flex flex-wrap items-baseline justify-between">
        <h1 className="mb-0 border-none tablet:mb-4">{t("responses.email.title")}</h1>
        <nav className="flex gap-3">
          {!isPublished && (
            <Link href={`/${language}/form-builder/${formId}/settings`} legacyBehavior>
              <a
                href={`/${language}/form-builder/${formId}/settings`}
                className="mb-0 mr-3 rounded-[100px] border-1 border-black px-5 py-1 text-black no-underline visited:text-black hover:bg-[#475569] hover:!text-white focus:bg-[#475569] focus:!text-white laptop:py-2 [&_svg]:focus:fill-white"
              >
                {t("responses.changeSetup")}
              </a>
            </Link>
          )}
        </nav>
      </div>
      <ClosedBanner id={formId} />
      <EmailResponseSettings
        emailAddress={email}
        subjectEn={emailSubject.en}
        subjectFr={emailSubject.fr}
      />
    </>
  );
};
