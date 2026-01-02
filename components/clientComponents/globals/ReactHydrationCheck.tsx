"use client";
import { useEffect, useState } from "react";

export const ReactHydrationCheck = () => {
  const [hydrationComplete, setHydrationComplete] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrationComplete(true);
  }, []);

  return <>{hydrationComplete && <div id="hydration-complete" />}</>;
};
