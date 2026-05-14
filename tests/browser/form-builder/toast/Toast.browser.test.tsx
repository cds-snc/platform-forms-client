import { beforeAll, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { useEffect } from "react";
import { render } from "../testUtils";
import { ToastContainer, toast } from "@formBuilder/components/shared/Toast";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

function waitForToast(selector: string, timeoutMs = 3000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }

      window.requestAnimationFrame(check);
    };

    check();
  });
}

function ToastHarness() {
  useEffect(() => {
    toast.success("Success message");
    toast.error("Error message", "wide");
  }, []);

  return (
    <>
      <ToastContainer autoClose={false} containerId="default" />
      <ToastContainer autoClose={false} containerId="wide" width="600px" />
    </>
  );
}

describe("<Toast />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders non-default colors for success and error toasts", async () => {
    await render(<ToastHarness />);

    const successMessage = page.getByText("Success message");
    const errorMessage = page.getByText("Error message");

    await expect.element(successMessage).toBeVisible();
    await expect.element(errorMessage).toBeVisible();

    const successToast = await waitForToast(".Toastify__toast--success");
    const errorToast = await waitForToast(".Toastify__toast--error");

    expect(successToast).toBeTruthy();
    expect(errorToast).toBeTruthy();

    expect(successToast?.className).toContain("Toastify__toast--success");
    expect(errorToast?.className).toContain("Toastify__toast--error");

    const successStyles = window.getComputedStyle(successToast as HTMLElement);
    const errorStyles = window.getComputedStyle(errorToast as HTMLElement);

    // Success toast should have green background (#ebfaf0) and dark green text (#14522b)
    expect(successStyles.backgroundColor).toBe("rgb(235, 250, 240)");
    expect(successStyles.color).toBe("rgb(20, 82, 43)");
    
    // Error toast should have light red background (#f9d2d7) and dark red text (#590d17)
    expect(errorStyles.backgroundColor).toBe("rgb(249, 210, 215)");
    expect(errorStyles.color).toBe("rgb(89, 13, 23)");
    
    // Success and error should have different backgrounds
    expect(errorStyles.backgroundColor).not.toBe(successStyles.backgroundColor);
  });
});