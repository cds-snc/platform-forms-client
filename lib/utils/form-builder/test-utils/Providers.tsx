import React from "react";
import { render } from "@testing-library/react";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { GroupStoreProvider } from "@lib/groups/useGroupStore";

export const Providers = ({ children, form }) => (
  <TemplateStoreProvider form={form} isPublished={undefined}>
    <GroupStoreProvider>{children}</GroupStoreProvider>
  </TemplateStoreProvider>
);

export const withProviders = (store, Element) => {
  return render(<Providers form={store}>{Element}</Providers>);
};
