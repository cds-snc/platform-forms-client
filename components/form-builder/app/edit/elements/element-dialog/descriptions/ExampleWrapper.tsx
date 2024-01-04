import { cn } from "@lib/utils";
import { FormikProvider, useFormik } from "formik";
import React from "react";

export const ExampleWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: () => {
      return;
    },
  });

  return (
    <div className={cn("relative rounded-lg border border-slate-400 bg-white p-4", className)}>
      <div className="absolute -top-4 right-6 rounded border border-slate-400 bg-violet-700 px-2 py-1 text-white">
        Try it out
      </div>
      <FormikProvider value={formik}>{children}</FormikProvider>
    </div>
  );
};
