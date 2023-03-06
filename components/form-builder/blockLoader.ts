import { FormElement } from "@lib/types";
import axios from "axios";

export type LoaderType = "attestation" | "address";

export const blockLoader = async (type: LoaderType, onData: (data: FormElement) => void) => {
  const allowedTypes = ["attestation", "address"];

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

  // the data is reversed here because we add the elements
  // one at a time to the top of the list
  result.data.reverse().forEach((data: FormElement) => {
    onData(data);
  });
};
