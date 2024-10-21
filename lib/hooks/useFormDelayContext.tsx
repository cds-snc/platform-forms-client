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
const getNumberOfRequiredQuestionsWithGroups = (form: FormProperties, currentGroup: string) => {
  const groupIds = form?.groups?.[currentGroup].elements;
  if (!groupIds) {
    return 0;
  }
  return form.elements
    .filter((element) => groupIds.find((id) => String(id) === String(element.id)))
    .filter((element) => element.properties.validation?.required === true).length;
};

const getNumberOfRequiredQuestionsWithoutGroups = (form: FormProperties) => {
  return form.elements.filter((element) => element.properties.validation?.required === true).length;
};

const calculateDelayWithGroups = (form: FormProperties, formDelay: FormDelay) => {
  const elapsedTime = Math.floor((Date.now() - formDelay.startTime) / 1000);
  // Uses state to get requried questions (vs. a non group that can use the current form)
  const delayFromFormData = formDelay.requiredQuestions - elapsedTime;
  return calculateSubmitDelay(delayFromFormData);
};

const calculateDelayWithoutGroups = (form: FormProperties) => {
  const delayFromFormData = getNumberOfRequiredQuestionsWithoutGroups(form);
  return calculateSubmitDelay(delayFromFormData);
};

export const useFormDelay = () => {
  const { formDelay, setFormDelay } = useContext(FormDelayContext);
  return {
    /**
     * Sets an initial start time that is later used to get the time a user has spent on a form.
     * Used only for forms with groups.
     * @param currentGroup group Id of the current page
     * @param form current form
     */
    setStartTime: () => {
      if (formDelay.startTime) {
        return;
      }
      setFormDelay({ ...formDelay, startTime: Date.now() });
    },
    /**
     * Set the form delay based on the current group. Used only for forms with groups.
     * @param currentGroup group Id of the current page
     * @param form current form
     */
    setFormDelayGroups: (form: FormProperties, currentGroup: string) => {
      const requiredQuestions = getNumberOfRequiredQuestionsWithGroups(form, currentGroup);
      setFormDelay({
        ...formDelay,
        requiredQuestions: requiredQuestions && formDelay.requiredQuestions + requiredQuestions,
      });
    },
    /**
     * Gets the form delay based on the form type. For non group forms, the countdown (SubmitButton)
     * starts immediately so the time a user spends on a form minus the required questions will be
     * small. While a form with groups, the countdown could be massive because branching logic
     * enables much bigger forms. This is why for a group form the time spent on the form is
     * subtracted from only the required questions along the pages path a user navigates; reducing
     * the delay used in the countdown.
     * @param form current form
     * @returns delay in seconds
     */
    getFormDelay: (form: FormProperties) => {
      const hasGroups = showReviewPage(form);
      return hasGroups
        ? calculateDelayWithGroups(form, formDelay)
        : calculateDelayWithoutGroups(form);
    },
  };
};
