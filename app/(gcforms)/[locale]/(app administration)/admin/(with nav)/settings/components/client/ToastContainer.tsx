"use client";
import { ToastContainer } from "@formBuilder/components/shared/Toast";

export const ToastWrapper = () => {
  return (
    <div className="sticky top-0">
      <ToastContainer containerId="default" />
    </div>
  );
};
