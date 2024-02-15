"use client";
import React from "react";
import Link from "next/link";
import { EmailResponseSettings } from "@clientComponents/form-builder/app/shared";
import { ClosedBanner } from "@clientComponents/form-builder/app/shared/ClosedBanner";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";
import { useParams } from "next/navigation";

export const DeliveryOptionEmail = ({
  email,
  emailSubject,
}: {
  email: string;
  emailSubject: { en: string; fr: string };
}) => {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { id } = useParams<{ id: string }>();

  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");

  const { getDeliveryOption, isPublished } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
    isPublished: s.isPublished,
  }));

  const deliveryOption = getDeliveryOption();

  return (
    <>
      {/* <Head>
          <title>{t("responses.email.title")}</title>
        </Head> */}
      <div className="mb-8 flex flex-wrap items-baseline justify-between">
        <h1 className="mb-0 border-none tablet:mb-4">
          {isAuthenticated ? t("responses.email.title") : t("responses.unauthenticated.title")}
        </h1>
        <nav className="flex gap-3">
          {!isPublished && (
            <Link href={`/${language}/form-builder/settings`} legacyBehavior>
              <a
                href={`/${language}/form-builder/settings`}
                className="mb-0 mr-3 rounded-[100px] border-1 border-black px-5 py-1 text-black no-underline !shadow-none visited:text-black hover:bg-[#475569] hover:!text-white focus:bg-[#475569] focus:!text-white laptop:py-2 [&_svg]:focus:fill-white"
              >
                {t("responses.changeSetup")}
              </a>
            </Link>
          )}
        </nav>
      </div>
      <ClosedBanner id={id} />
      <EmailResponseSettings
        emailAddress={deliveryOption?.emailAddress || ""}
        subjectEn={deliveryOption?.emailSubjectEn || ""}
        subjectFr={deliveryOption?.emailSubjectFr || ""}
      />
    </>
  );
};
