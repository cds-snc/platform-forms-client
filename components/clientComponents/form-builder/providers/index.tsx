import React, { ReactElement } from "react";
import { TemplateStoreProvider } from "@clientComponents/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { TemplateApiProvider } from "@clientComponents/form-builder/hooks";
import { FormRecord } from "@lib/types";

export const FormBuilderProviders = ({
  children,
  initialForm = null,
  backLink,
  locale,
  className = "",
}: {
  children: React.ReactNode;
  backLink?: ReactElement;
  className?: string;
  initialForm?: FormRecord | null;
  locale: string;
}) => {
  return (
    <TemplateStoreProvider {...{ ...initialForm, locale }}>
      <TemplateApiProvider>
        <RefStoreProvider>
          <div className={`flex h-full flex-col ${className}`}>
            {backLink && <>{backLink}</>}
            {children}
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
