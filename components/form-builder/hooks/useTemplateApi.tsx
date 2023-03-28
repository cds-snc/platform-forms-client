import { DeliveryOption, SecurityAttribute } from "@lib/types";
import axios, { AxiosError } from "axios";

type TemplateConfig = {
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
};

export const useTemplateApi = () => {
  const save = async ({
    jsonConfig,
    name,
    formID,
    publish = false,
    deliveryOption,
    securityAttribute,
  }: {
    jsonConfig: string;
    name?: string;
    formID?: string;
    publish?: boolean;
    deliveryOption?: DeliveryOption;
    securityAttribute?: SecurityAttribute;
  }) => {
    let formData;
    try {
      formData = JSON.parse(jsonConfig);
    } catch (e) {
      if (e instanceof SyntaxError) {
        return { error: new Error("failed to parse form data") };
      }
    }

    try {
      const url = formID ? `/api/templates/${formID}` : "/api/templates";

      let data: TemplateConfig = {};

      if (deliveryOption) {
        data = { deliveryOption };
      }

      if (securityAttribute) {
        data = { securityAttribute };
      }

      const result = await axios({
        url: url,
        method: formID ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          isPublished: publish ? true : false,
          formConfig: formData,
          name: name,
          ...data,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      // PUT request with a { formID, isPublished } payload will update the Form Template isPublished property
      if (publish && formID) {
        await axios({
          url: url,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            isPublished: true,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
      }

      return { id: result?.data?.id };
    } catch (err) {
      return { error: err as AxiosError };
    }
  };

  return { save };
};
