import { describe, it, expect, beforeAll } from "vitest";
import { page } from "../vitestBrowserShim";
import { SelectFormat } from "@responses-pilot/format/SelectFormat";
import { render } from "./testUtils";
import { setupFonts } from "./testHelpers";

import "@root/styles/app.scss";

describe("SelectFormat - Browser Mode", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should render the format selection page", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    await expect.element(page.getByTestId("format-page-title")).toBeInTheDocument();
  });

  it("should have Continue button disabled initially", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    await expect.element(page.getByTestId("continue-button")).toBeDisabled();
  });

  it("should enable Continue when a format is selected", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    // Select the CSV radio by test id
    await page.getByTestId("format-csv").click();

    await expect.element(page.getByTestId("continue-button")).toBeEnabled();
  });

  it("should have a Back link pointing to location with reset param", async () => {
    await render(<SelectFormat locale="en" id="test-form" />);

    // The back link is a regular anchor with the expected href
    const backLink = document.querySelector(
      'a[href="/en/form-builder/test-form/responses-pilot/location?reset=true"]'
    );

    expect(backLink).not.toBeNull();
  });
});
