import { useReducer } from "react";

/**
 * Hook that uses a time lock to prohibit actions
 * @returns state that includes: {cansubmit: boolean, remainingTime: seconds, timerDelay: seconds, timeLock: unix time}
 */

type FormTimerStateType = {
  canSubmit: boolean;
  remainingTime: number;
  timerDelay?: number;
  timeLock?: number;
};

type FormTimerDispatchType = {
  startTimer: (timerDelay: number) => void;
  checkTimer: () => void;
  disableTimer: () => void;
};
export const useFormTimer = (): [FormTimerStateType, FormTimerDispatchType] => {
  const actions = {
    START: "START",
    CHECK: "CHECK",
    DISABLE: "DISABLE",
  } as const;
  type actions = (typeof actions)[keyof typeof actions];

  function formTimerReducer(
    state: FormTimerStateType,
    action: { type: actions; timerDelay?: number }
  ): { canSubmit: boolean; remainingTime: number; timerDelay?: number; timeLock?: number } {
    switch (action.type) {
      case actions.START: {
        if (!action.timerDelay) throw new Error("Missing timerDelay on start FormTimer action");
        const newTimeLock = Date.now() + action.timerDelay * 1000;
        return {
          canSubmit: false,
          remainingTime: Math.floor((newTimeLock - Date.now()) / 1000),
          timerDelay: action.timerDelay,
          timeLock: newTimeLock,
        };
      }
      case actions.CHECK: {
        if (!state.timeLock)
          throw new Error("Start action must be called before Check on FormTimer");
        // Check if we're in test mode and disable the time lock for
        if (Date.now() > state.timeLock) {
          return { ...state, canSubmit: true, remainingTime: 0 };
        }
        const timeLeft = Math.floor((state.timeLock - Date.now()) / 1000);
        // If there is less than a second remaining let the user know it's only a second
        return { ...state, canSubmit: false, remainingTime: timeLeft >= 1 ? timeLeft : 1 };
      }
      case actions.DISABLE: {
        return { canSubmit: true, remainingTime: 0, timerDelay: 0, timeLock: 0 };
      }
      default: {
        throw new Error("Action for FormTimerReducer is not found");
      }
    }
  }

  const [formTimerState, formTimerDispatch] = useReducer(formTimerReducer, {
    canSubmit: false,
    remainingTime: 5,
  });

  /**
   * Starts the Form Timer
   * @param timerDelay The amount of time that must elaspe before allowing submitting in seconds
   */
  const startTimer = (timerDelay: number) => {
    formTimerDispatch({ type: actions.START, timerDelay });
  };

  /**
   * Check the Form Timer to see if enough time has passed
   */
  const checkTimer = () => {
    formTimerDispatch({ type: actions.CHECK });
  };

  /**
   * Disable the Form Timer from blocking submissions
   */
  const disableTimer = () => {
    formTimerDispatch({ type: actions.DISABLE });
  };

  return [formTimerState, { startTimer, checkTimer, disableTimer }];
};

export default useFormTimer;
