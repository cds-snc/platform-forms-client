import { EventKeys } from "@lib/hooks/useCustomEvent";

export const submitProgressDispatch = (submitProgress = 0.01, progressInterval, message) => {
  // Dispatch initial progress events (fake)
  // We just want show some submission progress until file uploads step takes over
  // Note the progress bar updates using Math.round(value * 100) ...
  progressInterval = setInterval(() => {
    if (submitProgress <= 0.1) {
      submitProgress += 0.02;
      document.dispatchEvent(
        new CustomEvent(EventKeys.submitProgress, {
          detail: {
            progress: submitProgress,
            message,
          },
        })
      );
    } else {
      clearInterval(progressInterval);
    }
  }, 500);

  return progressInterval;
};
