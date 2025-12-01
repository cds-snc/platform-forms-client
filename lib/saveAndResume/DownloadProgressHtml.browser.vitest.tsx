import { describe, it, expect, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { render, cleanup } from "vitest-browser-react";
import { DownloadProgressHtml } from "./DownloadProgressHtml";
import { formResponse, reviewItems } from "./fixtures/data";

describe("DownloadProgressHtml - Browser Mode", () => {
  beforeAll(() => {
    // Setup any fonts or global styles if needed
  });

  it("should render the in-progress badge", async () => {
    await render(
      <DownloadProgressHtml
        type="progress"
        formResponse={formResponse}
        reviewItems={reviewItems}
        language="en"
        host="http://localhost:3000"
        formId="123"
        formTitle="test"
        startSectionTitle="start"
      />
    );

    const badge = page.getByTestId("in-progress-badge");
    await expect.element(badge).toBeInTheDocument();
    await expect.element(badge).toBeVisible();
  });

  it("should render review list with applicant information", async () => {
    await render(
      <DownloadProgressHtml
        type="progress"
        formResponse={formResponse}
        reviewItems={reviewItems}
        language="en"
        host="http://localhost:3000"
        formId="123"
        formTitle="test"
        startSectionTitle="start"
      />
    );

    const reviewList = page.getByTestId("review-list");
    await expect.element(reviewList).toBeInTheDocument();
    await expect.element(reviewList).toBeVisible();

    // Check field labels
    const firstName = page.getByText("First name");
    await expect.element(firstName).toBeVisible();

    const lastName = page.getByText("Last name");
    await expect.element(lastName).toBeVisible();

    const department = page.getByText("Department or agency");
    await expect.element(department).toBeVisible();

    // Check field values
    const daveValue = page.getByText("Dave");
    await expect.element(daveValue).toBeVisible();

    const chengValue = page.getByText("Cheng");
    await expect.element(chengValue).toBeVisible();

    const agencyValue = page.getByText("Canada Border Services Agency");
    await expect.element(agencyValue).toBeVisible();

    cleanup();
  });
});
