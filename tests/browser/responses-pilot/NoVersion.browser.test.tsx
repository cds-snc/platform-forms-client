import { describe, it, expect, beforeAll } from "vitest";
import { page } from "vitest/browser";
import { SelectApiKey } from "@responses-pilot/load-key/SelectApiKey";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import { render } from "./testUtils";
import { setupFonts } from "./testHelpers";

import "@root/styles/app.css";

describe("Responses pilot - missing version handling (browser)", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("hides version selector and enables Continue when submissions have no version", async () => {
    const mockApiClient = {
      getNewFormSubmissions: async () => [
        {
          confirmationCode: "NOVERSION-1",
          createdAt: new Date().toISOString(),
          name: "Submission No Version",
        },
      ],
      formId: "test-form",
    } as unknown as GCFormsApiClient;

    await render(<SelectApiKey locale="en" id="test-form" />, { mockApiClient });

    // Version selector should not be rendered because no submissions provide a version
    const selector = document.querySelector('[data-testid="download-dialog-version-filter"]');
    expect(selector).toBeNull();

    // Continue button should be enabled since there are submissions and no multi-version blocking
    await expect.element(page.getByTestId("continue-button")).toBeEnabled();
  });
});
