export const formClosingDateEst = (utcDate: string) => {
  const date = new Date(utcDate);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  // Create a formatter for EST
  const formatter = new Intl.DateTimeFormat("en-CA", options);

  // Format the date in EST
  const parts = formatter.formatToParts(date);

  // Extract the parts
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const year = parts.find((part) => part.type === "year")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  return {
    month,
    day,
    year,
    hour,
    minute,
  };
};
