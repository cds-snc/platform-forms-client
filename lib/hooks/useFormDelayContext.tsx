"use client";
import { logMessage } from "@lib/logger";
import { FormElement, FormProperties } from "@lib/types";
import { createContext, useContext, useState } from "react";

interface FormDelay {
  startTime: number;
  requiredQuestions: number;
}

const timerDefault: FormDelay = {
  startTime: Date.now(), // TODO: Can refactor out to static return
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
    return 0;
  }
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  const delayFromFormData = requiredQuestions - elapsedTime;
  return calculateSubmitDelay(delayFromFormData);
};

export const calculateDelayWithoutGroups = (formElements: FormElement[]) => {
  if (!Array.isArray(formElements)) {
    return 0;
  }
  const delayFromFormData = formElements.filter(
    (element) => element.properties.validation?.required === true
  ).length;
  return calculateSubmitDelay(delayFromFormData);
};

export const useFormDelay = () => {
  const context = useContext(FormDelayContext);

  if (context === null) {
    throw new Error("formDelay must be used within a FormDelayContext");
  }
  const { formDelay, setFormDelay } = context;

  return {
    /**
     * Used by group form to track the initial form view (timestamp) and add the number of required
     * questions on the current group.
     * @param form the current form
     * @param currentGroupId group Id of the current page
     */
    updateFormDelay: (form: FormProperties, currentGroupId: string) => {
      try {
        const groupIds = form?.groups?.[currentGroupId].elements;

        if (!groupIds) {
          return;
        }

        const currentGroupRequiredQuestions = form.elements
          .filter((element) => groupIds.find((id) => String(id) === String(element.id)))
          .filter((element) => element.properties.validation?.required === true).length;

        setFormDelay({
          ...formDelay,
          requiredQuestions: formDelay.requiredQuestions + currentGroupRequiredQuestions,
        });
      } catch (error) {
        logMessage.debug("Error adding required questions to form delay");
      }
    },

    /**
     * Gets the form delay for forms without groups. This uses the total required questions to
     * calculate the delay.
     * @param form current form
     * @returns delay in seconds. 0 is used to disable (no delay) the form timer
     */
    getFormDelayWithoutGroups: (formElements: FormElement[]) => {
      try {
        const delay = calculateDelayWithoutGroups(formElements);

        logMessage.debug(`Delay: ${delay}, formDelay: ${JSON.stringify(formDelay)}`);

        return delay;
      } catch (error) {
        logMessage.info("Error calculating form delay.");
        return 0;
      }
    },

    /**
     * Gets the form delay for forms with groups. This subtracts the time spent on the form from
     * the tally of required questions from their group history (pages navigated).
     * @returns delay in seconds. 0 is used to disable (no delay) the form timer
     */
    getFormDelayWithGroups: () => {
      try {
        const endTime = Date.now();
        const delay = calculateDelayWithGroups(
          formDelay.startTime,
          endTime,
          formDelay.requiredQuestions
        );

        logMessage.debug(`Delay: ${delay}, formDelay: ${JSON.stringify(formDelay)}`);

        return delay;
        // return 0;
      } catch (error) {
        logMessage.debug("Error calculating form delay.");
        return 0;
      }
    },
  };
};
