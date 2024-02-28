"use client";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";

export const ToastWrapper = () => {
  return (
    <div className="sticky top-0">
      <ToastContainer containerId="default" />
    </div>
  );
};
