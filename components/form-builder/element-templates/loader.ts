import { FormElement, FormElementTypes } from "@lib/types";
import axios from "axios";

export const loader = async ({
  type,
  handleAddElement,
}: {
  type: string;
  handleAddElement: (index: number, type: FormElementTypes, data: FormElement) => void;
}) => {
  const result = await axios({
    url: "/api/form-builder/template",
    method: "POST",
    data: {
      elementType: type,
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  });

  result.data.forEach((el: FormElement) => {
    handleAddElement(0, el.type, el);
  });
};
