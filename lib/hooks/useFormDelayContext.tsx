import { logMessage } from "@lib/logger";
import { FormElement, FormProperties } from "@lib/types";
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
  return secondsBaseDelay + delayFromFormData * secondsPerFormElement;
};

const getNumberOfRequiredQuestionsWithGroups = (
  formElements: FormElement[],
  groupIds: string[]
) => {
  if (!Array.isArray(formElements) || !Array.isArray(groupIds)) {
    return 0;
  }
  return formElements
    .filter((element) => groupIds.find((id) => String(id) === String(element.id)))
    .filter((element) => element.properties.validation?.required === true).length;
};

const calculateDelayWithGroups = (
  startTime: number,
  endTime: number,
  requiredQuestions: number
) => {
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  const delayFromFormData = requiredQuestions - elapsedTime;
  return calculateSubmitDelay(delayFromFormData);
};

const calculateDelayWithoutGroups = (formElements: FormElement[]) => {
  const delayFromFormData = formElements.filter(
    (element) => element.properties.validation?.required === true
  ).length;
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
      if (!formDelay.startTime) {
        setFormDelay({ ...formDelay, startTime: Date.now() });
      }
    },
    /**
     * Adds the number of required questions in the current group to the form delay state.
     * @param currentGroup group Id of the current page
     * @param form current form
     */
    addRequiredQuestions: (form: FormProperties, currentGroup: string) => {
      try {
        const groupIds = form?.groups?.[currentGroup].elements;
        if (groupIds) {
          const newRequiredQuestions = getNumberOfRequiredQuestionsWithGroups(
            form.elements,
            groupIds
          );
          setFormDelay({
            ...formDelay,
            requiredQuestions: formDelay.requiredQuestions + newRequiredQuestions,
          });
        }
      } catch (error) {
        logMessage.info("Error adding required questions to form delay");
      }
    },
    /**
     * Gets the form delay based on the form type. For non group forms, the countdown (SubmitButton)
     * starts immediately so the time a user spends on a form minus the required questions will be
     * small. On the other hand, for a form with groups the countdown could be massive because
     * branching logic enables much bigger forms. This is why for a group form the time spent on the
     * form is subtracted from only the required questions along the pages path a user navigates;
     * reducing the delay used in the countdown.
     * @param form current form
     * @returns delay in seconds or in the case of an error -1 to fallback to no delay
     */
    getFormDelay: (formElements: FormElement[], hasGroups: boolean) => {
      try {
        const endTime = Date.now();

        const delay = hasGroups
          ? calculateDelayWithGroups(formDelay.startTime, endTime, formDelay.requiredQuestions)
          : calculateDelayWithoutGroups(formElements);

        formDelayLogger(delay, formDelay);

        // Check for 0 because the SubmitButton relies on 0 to disable the button
        return delay === 0 ? -1 : delay;
      } catch (error) {
        logMessage.info("Error calculating form delay.");
        return -1;
      }
    },
  };
};

// Turn on for local testing
const debug = true;
const formDelayLogger = (delay: number, formDelay: FormDelay) => {
  if (debug) {
    logMessage.info(`Form delay: ${delay}, formDelay state: ${JSON.stringify(formDelay)}`);
  }
};
