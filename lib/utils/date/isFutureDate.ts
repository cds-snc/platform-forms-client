export const isFutureDate = (utcDate?: string) => {
  if (!utcDate) {
    return false;
  }
  const date = new Date(utcDate);
  const now = new Date();
  return date > now;
};
