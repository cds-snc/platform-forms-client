import { beforeAll, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { SettingsNavigation } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/components/SettingsNavigation";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/form-builder/test-form-id/settings",
  useParams: () => ({ locale: "en" }),
}));

describe("<SettingsNavigation />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("shows Manage access when locked editing is enabled", async () => {
    await render(<SettingsNavigation id="test-form-id" showManageAccess={true} />);

    const button = page.getByRole("button", { name: /Manage access/i });
    await expect.element(button).toBeVisible();
  });

  it("hides Manage access when locked editing is disabled", async () => {
    await render(<SettingsNavigation id="test-form-id" showManageAccess={false} />);

    const button = page.getByRole("button", { name: /Manage access/i });
    await expect.element(button).not.toBeInTheDocument();
  });
});
