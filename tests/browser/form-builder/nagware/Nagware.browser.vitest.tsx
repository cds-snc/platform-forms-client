import { describe, it, expect, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { Nagware } from "@formBuilder/components/Nagware";
import { NagLevel } from "@lib/types";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";


describe("<Nagware />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders UnsavedOver35Days", async () => {
    await render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver35DaysOld,
          numberOfSubmissions: 5,
        }}
      />
    );

    const alert = page.getByRole("alert");
    await expect.element(alert).toBeVisible();
    
    const alertClass = await alert.element().getAttribute("class");
    expect(alertClass).toContain("bg-red-50");

    const numberOfSubmissions = page.getByTestId("numberOfSubmissions");
    await expect.element(numberOfSubmissions).toHaveTextContent("5");
  });

  it("renders UnconfirmedOver35Days", async () => {
    await render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
          numberOfSubmissions: 3,
        }}
      />
    );

    const alert = page.getByRole("alert");
    await expect.element(alert).toBeVisible();
    
    const alertClass = await alert.element().getAttribute("class");
    expect(alertClass).toContain("bg-red-50");

    const numberOfSubmissions = page.getByTestId("numberOfSubmissions");
    await expect.element(numberOfSubmissions).toHaveTextContent("3");
  });

  it("renders UnsavedOver21Days", async () => {
    await render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver21DaysOld,
          numberOfSubmissions: 1,
        }}
      />
    );

    const alert = page.getByRole("alert");
    await expect.element(alert).toBeVisible();
    
    const alertClass = await alert.element().getAttribute("class");
    expect(alertClass).toContain("bg-yellow-50");

    const numberOfSubmissions = page.getByTestId("numberOfSubmissions");
    await expect.element(numberOfSubmissions).toHaveTextContent("1");
  });

  it("renders UnconfirmedOver21Days", async () => {
    await render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
          numberOfSubmissions: 2,
        }}
      />
    );

    const alert = page.getByRole("alert");
    await expect.element(alert).toBeVisible();
    
    const alertClass = await alert.element().getAttribute("class");
    expect(alertClass).toContain("bg-yellow-50");

    const numberOfSubmissions = page.getByTestId("numberOfSubmissions");
    await expect.element(numberOfSubmissions).toHaveTextContent("2");
  });
});
