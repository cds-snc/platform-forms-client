import React from "react";
import PropTypes from "prop-types";
import { render } from "@testing-library/react";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { GroupStoreProvider } from "@lib/groups/useGroupStore";

export const Providers = ({ children, form }) => (
  <TemplateStoreProvider form={form} submission={undefined} isPublished={undefined}>
    <GroupStoreProvider>{children}</GroupStoreProvider>
  </TemplateStoreProvider>
);

Providers.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.any]),
  form: PropTypes.object,
};

export const withProviders = (store, Element) => {
  return render(<Providers form={store}>{Element}</Providers>);
};
