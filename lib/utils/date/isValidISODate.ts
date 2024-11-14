export const isValidISODate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return !Number.isNaN(date.valueOf()) && date.toISOString() === dateString;
  } catch (error) {
    return false;
  }
};
