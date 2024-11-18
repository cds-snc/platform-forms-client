// note: 604,800 = 60 * 60 * 24 * 7
export const getWeeksInSeconds = (weeks: number) => {
  return weeks * 604800 * 1000;
};

export const getSecondsInWeeks = (seconds: number) => {
  return Math.round(seconds / 604800 / 1000);
};
