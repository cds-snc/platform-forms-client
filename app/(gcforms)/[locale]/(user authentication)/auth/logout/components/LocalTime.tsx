"use client";

export const LocalTime = ({ locale }: { locale: string }) => {
  let time: string | null = null;

  if (typeof window !== "undefined") {
    const logoutTime = sessionStorage.getItem("logoutTime");
    if (logoutTime) {
      try {
        const parsedTime = JSON.parse(logoutTime);
        time = parsedTime[locale] || null;
      } catch (error) {
        // no-op
      }
    }
  }

  return <div className="mb-8 flex text-sm font-normal">{time ? time : <span>&nbsp;</span>}</div>;
};
