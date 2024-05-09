"use client";
import { InputFieldProps } from "@lib/types";
import React from "react";

enum DatePart {
  Day = "DD",
  Month = "MM",
  Year = "YYYY",
}

interface FormattedDateProps extends InputFieldProps {
  dateParts: DatePart[];
  monthSelector: "numeric" | "select";
}

export const FormattedDate = (props: FormattedDateProps): React.ReactElement => {
  const { id, name, className, required, ariaDescribedBy, dateParts } = props;

  return <div>FormattedDate</div>;
};
