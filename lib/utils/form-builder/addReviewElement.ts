import { FormProperties, FormElementTypes } from "@lib/types";

export const getReviewElementId = () => {
  return 10000000000001;
};

export const addReviewElement = (defaultForm: FormProperties) => {
  // TODO: find a way to make the Id unique probably by using the layout and grabbing the last Id+1
  const reviewElement = {
    id: getReviewElementId(),
    type: FormElementTypes.review,
    properties: {
      titleEn: "-",
      titleFr: "-",
      descriptionEn: "-",
      descriptionFr: "-",
    },
  };
  const result = {
    ...defaultForm,
    elements: [...defaultForm.elements, reviewElement],
  };
  return result;
};
