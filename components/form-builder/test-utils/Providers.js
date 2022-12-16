import React from "react";
import PropTypes from "prop-types";
import { render, act } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { TemplateStoreProvider } from "../store";

export const Providers = ({ children, form }) => (
  <SessionProvider session={null}>
    <TemplateStoreProvider form={form} submission={undefined} isPublished={undefined}>
      {children}
    </TemplateStoreProvider>
  </SessionProvider>
);

Providers.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.any]),
  form: PropTypes.object,
};

export const withProviders = async (store, Element) => {
  let rendered = null;
  await act(() => {
    rendered = render(<Providers form={store.form}>{Element}</Providers>);
  });
  return rendered;
};
