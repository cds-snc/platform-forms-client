"use client";

import { useEffect, useState } from "react";

export const LocalTime = ({ locale }: { locale: string }) => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const logoutTime = sessionStorage.getItem("logoutTime");
    if (logoutTime) {
      const parsedTime = JSON.parse(logoutTime);
      setTime(parsedTime[locale]);
    }
  }, [locale]);

  return <div className="mb-8 flex text-sm font-normal">{time ? time : <span>&nbsp;</span>}</div>;
};
