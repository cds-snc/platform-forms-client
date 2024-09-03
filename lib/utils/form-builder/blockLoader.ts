import { FormElement } from "@lib/types";
import axios from "axios";
import { allowedTemplates } from "@lib/utils/form-builder";

export type LoaderType = (typeof allowedTemplates)[number];

export const blockLoader = async (
  type: LoaderType,
  startIndex: number,
  onData: (data: FormElement, position: number) => void
) => {
  if (!allowedTemplates.includes(type)) {
    return;
  }

  const result = await axios({
    url: "/api/form-builder/load-blocks",
    method: "POST",
    data: {
      elementType: type,
    },
    timeout: process.env.NODE_ENV === "production" ? 5000 : 0,
  });

  result.data.forEach((data: FormElement, index: number) => {
    onData(data, startIndex + index);
  });
};
