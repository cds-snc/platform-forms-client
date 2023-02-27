import { FormElement } from "@lib/types";
import axios from "axios";

export type LoaderType = "attestation";

export const blockLoader = async (type: LoaderType, onData: (data: FormElement) => void) => {
  const allowedTypes = ["attestation"];

  if (!allowedTypes.includes(type)) {
    return;
  }

  const result = await axios({
    url: "/api/form-builder/load-block",
    method: "POST",
    data: {
      elementType: type,
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  });

  result.data.forEach((data: FormElement) => {
    onData(data);
  });
};
