import React, { ReactNode } from "react";
import { render } from "@testing-library/react";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { GroupStoreProvider } from "@lib/groups/useGroupStore";
import type { FormProperties } from "@gcforms/types";

export const Providers = ({ children, form }: { children: ReactNode; form: FormProperties }) => (
  <TemplateStoreProvider form={form} isPublished={undefined}>
    <GroupStoreProvider>{children}</GroupStoreProvider>
  </TemplateStoreProvider>
);

export const withProviders = (store: FormProperties, Element: ReactNode) => {
  return render(<Providers form={store}>{Element}</Providers>);
};
