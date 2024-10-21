import { FormProperties } from "@lib/types";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { createContext, useContext, useState } from "react";

interface FormDelay {
  startTime: number;
  requiredQuestions: number;
}

const timerDefault: FormDelay = {
  startTime: 0,
  requiredQuestions: 0,
};

const FormDelayContext = createContext<{
  formDelay: FormDelay;
  setFormDelay: React.Dispatch<React.SetStateAction<FormDelay>>;
}>({
  formDelay: timerDefault,
  setFormDelay: () => {},
});

export const FormDelayProvider = ({ children }: { children: React.ReactNode }) => {
  const [formDelay, setFormDelay] = useState(timerDefault);
  return (
    <FormDelayContext.Provider value={{ formDelay, setFormDelay }}>
      {children}
    </FormDelayContext.Provider>
  );
};

/**
 * Adds in a little math to make it more unpredictable and calculates the final form delay.
 * @param delayFromFormData
 * @returns submit delay in seconds, or -1 to flag no delay. -1 is used because 0 is used for the
 * disabled state in the Submit button
 */
const calculateSubmitDelay = (delayFromFormData: number) => {
  const secondsBaseDelay = 2;
  const secondsPerFormElement = 2;
  const submitDelay = secondsBaseDelay + delayFromFormData * secondsPerFormElement;
  return submitDelay > 0 ? submitDelay : -1;
};

/**
 * Get the required questions on the current page/group. This will be 0 if the page has no required
 * questions. Note that if a user clicks "back" to previous page/group, the required questions will
 * be added to the required questions count again. This adds a little more unpredictability and
 * makes it harder to guess the delay.
 * @param form current form
 * @param currentGroup curent group/page Id
 * @returns count of required questions on the current page/group
 */
const getNumberOfRequireQuestionsGroups = (form: FormProperties, currentGroup: string) => {
  const groupIds = form?.groups?.[currentGroup].elements;
  if (!groupIds) {
    return 0;
  }
  return form.elements
    .filter((element) => groupIds.find((id) => String(id) === String(element.id)))
    .filter((element) => element.properties.validation?.required === true).length;
};

const getNumberOfRequireQuestionsWithoutGroups = (form: FormProperties) => {
  return form.elements.filter((element) => element.properties.validation?.required === true).length;
};

const calculateDelayWithoutGroups = (form: FormProperties) => {
  const delayFromFormData = getNumberOfRequireQuestionsWithoutGroups(form);
  return calculateSubmitDelay(delayFromFormData);
};

const calculateDelayWithGroups = (form: FormProperties, formDelay: FormDelay) => {
  const elapsedTime = Math.floor((Date.now() - formDelay.startTime) / 1000);
  // Uses state to get requried questions (vs. a non group form that uses the form to get all quriered questions)
  const delayFromFormData = formDelay.requiredQuestions - elapsedTime;
  return calculateSubmitDelay(delayFromFormData);
};

export const useFormDelay = () => {
  const { formDelay, setFormDelay } = useContext(FormDelayContext);
  return {
    setStartTime: () => {
      if (formDelay.startTime) {
        return;
      }
      setFormDelay({ ...formDelay, startTime: Date.now() });
    },
    /**
     * Used only for forms with groups. This will set the form delay based on the current group.
     * Note the startTime timestamp once the user click the "next" button on the first page.
     * @param currentGroup group Id of the current page
     * @param form current form
     */
    setFormDelayGroups: (form: FormProperties, currentGroup: string) => {
      const requiredQuestions = getNumberOfRequireQuestionsGroups(form, currentGroup);
      setFormDelay({
        ...formDelay,
        requiredQuestions: requiredQuestions && formDelay.requiredQuestions + requiredQuestions,
      });
    },
    getFormDelay: (form: FormProperties) => {
      const hasGroups = showReviewPage(form);
      return hasGroups
        ? calculateDelayWithGroups(form, formDelay)
        : calculateDelayWithoutGroups(form);
    },
  };
};
