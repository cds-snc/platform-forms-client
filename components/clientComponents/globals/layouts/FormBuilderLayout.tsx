"use client";
import { TemplateStoreProvider } from "@clientComponents/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { TemplateApiProvider } from "@clientComponents/form-builder/hooks";
import { FormRecord } from "@lib/types";

export const FormBuilderInitializer = ({
  children,
  initialForm = null,
  locale,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  initialForm?: FormRecord | null;
  locale: string;
}) => {
  return (
    <TemplateStoreProvider {...{ ...initialForm, locale }}>
      <TemplateApiProvider>
        <RefStoreProvider>
          <div className={`flex h-full flex-col ${className}`}>{children}</div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
