"use client";
import { useTranslation } from "@i18n/client";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import { useRehydrate } from "@clientComponents/form-builder/hooks";
import { Branding } from "@clientComponents/form-builder/app/branding";

interface BrandingClientSideProps {
  hasBrandingRequestForm: boolean;
  id: string;
}

export const ClientSide = ({ hasBrandingRequestForm, id }: BrandingClientSideProps) => {
  const { t } = useTranslation("form-builder");

  const hasHydrated = useRehydrate();
  if (!hasHydrated) return null;

  return (
    <div className="max-w-4xl">
      <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>
      <SettingsNavigation id={id} />
      <Branding hasBrandingRequestForm={hasBrandingRequestForm} />
    </div>
  );
};
