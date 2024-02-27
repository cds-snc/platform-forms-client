import React from "react";
import PropTypes from "prop-types";
import { render, act } from "@testing-library/react";
import { TemplateStoreProvider } from "../../../../lib/store";

export const Providers = ({ children, form }) => (
  <TemplateStoreProvider form={form} submission={undefined} isPublished={undefined}>
    {children}
  </TemplateStoreProvider>
);

Providers.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.any]),
  form: PropTypes.object,
};

export const withProviders = async (store, Element) => {
  let rendered = null;
  await act(() => {
    rendered = render(<Providers form={store}>{Element}</Providers>);
  });
  return rendered;
};
