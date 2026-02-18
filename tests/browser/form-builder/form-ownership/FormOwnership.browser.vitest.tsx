import { describe, it, expect, vi, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { FormOwnership } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/components/manageFormOwners/FormOwnership";
import { FormRecord } from "@lib/types";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

const allUsers = [
  { id: "1", name: "John Doe", email: "john.doe@test.com" },
  { id: "2", name: "Jane Doe", email: "jane.doe@test.com" },
  { id: "3", name: "John Smith", email: "john.smith@test.com" },
  { id: "4", name: "Jane Smith", email: "jane.smith@test.com" },
];

const usersAssignedToFormRecord = [{ id: "1", name: "John Doe", email: "john.doe@test.com" }];

describe("<FormOwnership />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("can mount the component", async () => {
    const updateTemplateUsersSpy = vi.fn();

    await render(
      <FormOwnership
        formRecord={{ id: "test-form-id" } as FormRecord}
        usersAssignedToFormRecord={[]}
        allUsers={[]}
        nonce={null}
        updateTemplateUsers={updateTemplateUsersSpy}
      />
    );

    const heading = page.getByText("Manage ownership");
    await expect.element(heading).toBeVisible();
  });

  it("can render the component with users assigned", async () => {
    const updateTemplateUsersSpy = vi.fn();

    await render(
      <FormOwnership
        formRecord={{ id: "test-form-id" } as FormRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
        nonce={null}
        updateTemplateUsers={updateTemplateUsersSpy}
      />
    );

    const heading = page.getByText("Manage ownership");
    await expect.element(heading).toBeVisible();

    const userEmail = page.getByText("john.doe@test.com");
    await expect.element(userEmail).toBeVisible();
  });
});
