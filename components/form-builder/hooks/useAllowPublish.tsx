import { useCallback } from "react";
import { useSession } from "next-auth/react";

import { FormElement, FormElementTypes, FormProperties, PropertyChoices } from "@lib/types";
import { useAccessControl } from "@lib/hooks";
import { Description, publishRequiredFields, Title } from "../types";
import { useTemplateStore } from "../store/useTemplateStore";

export class MissingTranslation extends Error {}

export const isTitleTranslated = (element: Title) => {
  if (!element.titleEn || !element.titleFr) {
    throw new MissingTranslation();
  }
};

export const isDescriptionTranslated = (element: Description) => {
  if (!element.descriptionEn || !element.descriptionFr) {
    throw new MissingTranslation();
  }
};

export const areChoicesTranslated = (choices: PropertyChoices[]) => {
  choices.forEach((choice) => {
    // ensure choices have a value to be translated
    let empty = false;
    if (choice.en === "" && choice.fr === "") {
      empty = true;
    }

    if (!empty && (!choice.en || !choice.fr)) {
      throw new MissingTranslation();
    }
  });
};

export const isFormElementTranslated = (element: FormElement) => {
  if (element.type === FormElementTypes.richText) {
    isDescriptionTranslated(element.properties);
  } else {
    isTitleTranslated(element.properties);

    // Description is optional
    if (element.properties.descriptionEn || element.properties.descriptionFr) {
      isDescriptionTranslated(element.properties);
    }

    // Only check choices for Select, Radio, and Checkbox
    if (
      [FormElementTypes.checkbox, FormElementTypes.radio, FormElementTypes.dropdown].includes(
        element.type
      )
    ) {
      // Check choices if there are any
      if (element.properties.choices) {
        areChoicesTranslated(element.properties.choices);
      }
    }
  }
};

export const isFormTranslated = (form: FormProperties) => {
  try {
    isTitleTranslated(form);

    // Introduction is optional, but must be translated if present
    if (form.introduction?.descriptionEn || form.introduction?.descriptionFr) {
      isDescriptionTranslated(form.introduction);
    }

    isDescriptionTranslated(form.privacyPolicy ?? {});
    isDescriptionTranslated(form.endPage ?? {});

    form.elements.forEach((element) => {
      isFormElementTranslated(element);
    });
  } catch (e) {
    return false;
  }

  return true;
};

export const useAllowPublish = () => {
  const { status } = useSession();
  const { ability } = useAccessControl();
  const { form, submission } = useTemplateStore((s) => ({
    form: s.form,
    submission: s.submission,
  }));
  let email = "";
  if (submission?.email) {
    email = submission?.email;
  }

  const userCanPublish = ability?.can("update", "FormRecord", "isPublished");

  const data = {
    title: !!form?.titleEn || !!form?.titleFr,
    questions: !!form?.elements?.length,
    privacyPolicy: !!form?.privacyPolicy?.descriptionEn || !!form?.privacyPolicy?.descriptionFr,
    confirmationMessage: !!form?.endPage?.descriptionEn || !!form?.endPage?.descriptionFr,
    translate: isFormTranslated(form),
    responseDelivery: !!email,
  };

  const hasData = useCallback(
    (fields: publishRequiredFields[]) => {
      return fields.every(
        (field) => Object.prototype.hasOwnProperty.call(data, field) && data[field] === true
      );
    },
    [data]
  );

  const isPublishable = useCallback(() => {
    const fields = Object.keys(data) as unknown as publishRequiredFields[];
    return hasData(fields);
  }, [data, hasData]);

  const isSaveable = useCallback(() => {
    return status === "authenticated" && hasData(["title", "questions"]);
  }, [hasData, status]);

  return { data, hasData, isPublishable, isSaveable, userCanPublish };
};
