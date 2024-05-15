"use client";

import { useEffect, useState } from "react";

/**
 * Get the users local time.
 * The server time on AWS will always be in UTC. To get the users local time, the browesrs locale
 * (run client side) is used to construct and return the user's local time.
 */
export const LocalTime = ({ locale }: { locale: string }) => {
  // Works around a hydration issue where the time rendered on the server doesn't match the cilent
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <>
      {hydrated &&
        new Date().toLocaleString(`${locale + "-CA"}`, {
          timeZone: tz,
        })}
    </>
  );
};
