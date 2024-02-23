"use client";
import { useRehydrate } from "@clientComponents/form-builder/hooks";
import { Branding } from "@clientComponents/form-builder/app/branding";

interface BrandingClientSideProps {
  hasBrandingRequestForm: boolean;
}

export const ClientSide = ({ hasBrandingRequestForm }: BrandingClientSideProps) => {
  const hasHydrated = useRehydrate();
  if (!hasHydrated) return null;

  return <Branding hasBrandingRequestForm={hasBrandingRequestForm} />;
};
