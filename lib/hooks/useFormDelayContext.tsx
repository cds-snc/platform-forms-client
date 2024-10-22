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

// Adds in a little math to make it more unpredictable and calculates the final form delay
const calculateSubmitDelay = (delayFromFormData: number) => {
  const secondsBaseDelay = 2; // To help test group forms, make this big e.g. 20000
  const secondsPerFormElement = 2;
  return secondsBaseDelay + delayFromFormData * secondsPerFormElement;
};

export const calculateDelayWithGroups = (
  startTime: number,
  endTime: number,
  requiredQuestions: number
) => {
  if (isNaN(startTime) || isNaN(endTime) || isNaN(requiredQuestions)) {
    return -1;
  }
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  const delayFromFormData = requiredQuestions - elapsedTime;
  return calculateSubmitDelay(delayFromFormData);
};

export const calculateDelayWithoutGroups = (formElements: FormElement[]) => {
  if (!Array.isArray(formElements)) {
    return -1;
  }
  const delayFromFormData = formElements.filter(
    (element) => element.properties.validation?.required === true
  ).length;
  return calculateSubmitDelay(delayFromFormData);
};

// Turn on for local testing
const debug = false;

export const useFormDelay = () => {
  const { formDelay, setFormDelay } = useContext(FormDelayContext);
  return {
    /**
     * Adds the number of required questions in the current group to the form delay state.
     * @param form the current form
     * @param currentGroupId group Id of the current page
     */
    addRequiredQuestions: (form: FormProperties, currentGroupId: string) => {
      try {
        const groupIds = form?.groups?.[currentGroupId].elements;
        if (!groupIds) {
          return;
        }

        const currentGroupRequiredQuestions = form.elements
          .filter((element) => groupIds.find((id) => String(id) === String(element.id)))
          .filter((element) => element.properties.validation?.required === true).length;

        setFormDelay({
          requiredQuestions: formDelay.requiredQuestions + currentGroupRequiredQuestions,
          // Set start time timestamp on initial call
          startTime: formDelay.startTime === 0 ? Date.now() : formDelay.startTime,
        });
      } catch (error) {
        logMessage.info("Error adding required questions to form delay");
      }
    },
    /**
     * Gets the form delay based on the form type. For non-group forms, just send the required
     * questions on a form. For group forms, subtract the time spent on the form from the tally of
     * required questions from their group history (pages navigated).
     * @param form current form
     * @param hasGroups boolean to determine if the form has groups
     * @returns delay in seconds or in the case of an error -1 is used to fallback to no delay
     */
    getFormDelay: (formElements: FormElement[], hasGroups: boolean) => {
      try {
        const endTime = Date.now();
        const delay = hasGroups
          ? calculateDelayWithGroups(formDelay.startTime, endTime, formDelay.requiredQuestions)
          : calculateDelayWithoutGroups(formElements);

        debug && logMessage.info(`Delay: ${delay}, formDelay: ${JSON.stringify(formDelay)}`);

        // Avoid 0 because the SubmitButton relies on this to disable itself
        return delay === 0 ? -1 : delay;
      } catch (error) {
        logMessage.info("Error calculating form delay.");
        return -1;
      }
    },
  };
};
