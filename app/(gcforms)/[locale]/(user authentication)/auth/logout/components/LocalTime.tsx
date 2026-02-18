"use client";

import { useEffect, useState } from "react";

export const LocalTime = ({ locale }: { locale: string }) => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let handle: number | undefined;
    try {
      const logoutTime = sessionStorage.getItem("logoutTime");
      if (!logoutTime) return;
      const parsedTime = JSON.parse(logoutTime);
      // Defer state update to avoid synchronous setState inside effect
      handle = window.setTimeout(() => {
        setTime(parsedTime[locale] || null);
      }, 0);
    } catch (error) {
      // no-op --- if parsing fails, we simply don't show the time
    }

    return () => {
      if (handle) {
        clearTimeout(handle);
      }
    };
  }, [locale]);

  return <div className="mb-8 flex text-sm font-normal">{time ? time : <span>&nbsp;</span>}</div>;
};
