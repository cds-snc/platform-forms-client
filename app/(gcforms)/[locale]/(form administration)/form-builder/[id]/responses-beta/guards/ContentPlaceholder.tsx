"use client";

import { Spinner } from "@clientComponents/forms/SubmitProgress/Spinner";

export const ContentPlaceholder = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner />
    </div>
  );
};
