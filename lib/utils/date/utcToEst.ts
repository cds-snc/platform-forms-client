export const formClosingDateEst = (utcDate: string, lang: string = "en") => {
  const date = new Date(utcDate);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    // hourCycle: "h12", -- will be added in a future release
  };

  const locale = lang === "fr" ? "fr-CA" : "en-CA";

  // Create a formatter for EST
  const formatter = new Intl.DateTimeFormat(locale, options);

  // Format the date in EST
  const parts = formatter.formatToParts(date);

  // Extract the parts
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const year = parts.find((part) => part.type === "year")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  // const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value;

  return {
    month,
    day,
    year,
    hour,
    minute,
    // dayPeriod,
  };
};
