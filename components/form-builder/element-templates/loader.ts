import { FormElement } from "@lib/types";
import axios from "axios";

export const loader = async (type: string, onData: (data: FormElement) => void) => {
  const result = await axios({
    url: "/api/form-builder/template",
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
