import { cn } from "@lib/utils";
import { FormikProvider, useFormik } from "formik";
import React from "react";
import { useTranslation } from "@i18n/client";

export const ExampleWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { t } = useTranslation("form-builder");

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: () => {
      return;
    },
  });

  return (
    <fieldset className={cn("relative rounded-lg border border-slate-400 bg-white p-4", className)}>
      <legend className="absolute -top-4 right-6 rounded border border-slate-400 bg-violet-700 px-2 py-1 text-white">
        {t("addElementDialog.tryIt")}
      </legend>
      <FormikProvider value={formik}>{children}</FormikProvider>
    </fieldset>
  );
};
