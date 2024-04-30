"use client";
import { useEffect, useState } from "react";

export const HydrationCheck = () => {
  const [hydrationComplete, setHydrationComplete] = useState(false);

  useEffect(() => {
    setHydrationComplete(true);
  }, []);

  return <>{hydrationComplete && <div id="hydration-complete" />}</>;
};
