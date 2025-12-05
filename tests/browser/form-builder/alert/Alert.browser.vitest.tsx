import { describe, it, expect, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { Alert } from "@clientComponents/globals";
import { CircleCheckIcon } from "@serverComponents/icons/CircleCheckIcon";
import { Button } from "@clientComponents/globals";
import Link from "next/link";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<Alert />", () => {
  beforeAll(() => {
    setupFonts();
  });

  describe("Alerts by status", () => {
    it("Renders a SUCCESS alert", async () => {
      await render(<Alert.Success title="This is a title" body="This is a body" />);
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveClass(/bg-emerald-50/);
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toHaveClass(/\[&_svg\]:fill-emerald-700/);
      
      const alertHeading = page.getByTestId("alert-heading");
      await expect.element(alertHeading).toHaveClass(/text-emerald-700/);
    });

    it("Renders a WARNING alert", async () => {
      await render(<Alert.Warning title="This is a title" body="This is a body" />);
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveClass(/bg-yellow-50/);
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toHaveClass(/\[&_svg\]:fill-yellow-700/);
      
      const alertHeading = page.getByTestId("alert-heading");
      await expect.element(alertHeading).toHaveClass(/text-slate-950/);
    });

    it("Renders am INFO alert", async () => {
      await render(<Alert.Info title="This is a title" body="This is a body" />);
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveClass(/bg-indigo-50/);
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toHaveClass(/\[&_svg\]:fill-slate-950/);
      
      const alertHeading = page.getByTestId("alert-heading");
      await expect.element(alertHeading).toHaveClass(/text-slate-950/);
    });

    it("Renders am DANGER alert", async () => {
      await render(<Alert.Danger title="This is a title" body="This is a body" />);
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveClass(/bg-red-50/);
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toHaveClass(/\[&_svg\]:fill-red-700/);
      
      const alertHeading = page.getByTestId("alert-heading");
      await expect.element(alertHeading).toHaveClass(/text-red-700/);
    });
  });

  describe("Alerts using props", () => {
    it("Renders a basic alert with title, body, and custom icon", async () => {
      await render(
        <Alert.Success
          title="This is a title"
          body="This is a body"
          icon={<CircleCheckIcon className="mr-1 size-12" />}
        />
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();

      const heading = document.querySelector("[data-testid='alert'] h2");
      expect(heading?.textContent).toBe("This is a title");
      
      const alertText = await alert.element().textContent;
      expect(alertText).toContain("This is a body");
    });

    it("Renders a basic alert with title, body, and default icon", async () => {
      await render(<Alert.Warning title="This is a title" body="This is a body" />);

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("WarningIcon");

      const heading = document.querySelector("[data-testid='alert'] h2");
      expect(heading?.textContent).toBe("This is a title");
      
      const alertText = await alert.element().textContent;
      expect(alertText).toContain("This is a body");
    });

    it("Renders a basic alert with title, body, and no icon", async () => {
      await render(<Alert.Warning title="This is a title" body="This is a body" icon={false} />);

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = document.querySelector("[data-testid='alert-icon']");
      expect(alertIcon).toBeNull();

      const heading = document.querySelector("[data-testid='alert'] h2");
      expect(heading?.textContent).toBe("This is a title");
      
      const alertText = await alert.element().textContent;
      expect(alertText).toContain("This is a body");
    });
  });

  describe("Dismissible alerts", () => {
    it("Renders a dismissible alert", async () => {
      await render(<Alert.Success dismissible title="This is a title" body="This is a body" />);
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const dismissButton = page.getByTestId("alert-dismiss");
      await expect.element(dismissButton).toBeVisible();
      await dismissButton.click();
      
      const alertAfterDismiss = document.querySelector("[data-testid='alert']");
      expect(alertAfterDismiss).toBeNull();
    });

    it("Renders a dismissible alert with custom dismiss action", async () => {
      let called = false;
      const onDismissHandler = () => {
        called = true;
      };

      await render(
        <Alert.Success
          dismissible
          onDismiss={onDismissHandler}
          title="This is a title"
          body="This is a body"
        />
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const dismissButton = page.getByTestId("alert-dismiss");
      await dismissButton.click();
      
      expect(called).toBe(true);
    });
  });

  describe("Focussable alerts", () => {
    it("Renders a focussable alert", async () => {
      await render(<Alert.Success focussable title="This is a title" body="This is a body" />);
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const focused = document.activeElement;
      expect(focused?.getAttribute("data-testid")).toBe("alert");
    });
  });

  describe("Default icons", () => {
    it("Renders an Info alert with default Icon", async () => {
      await render(
        <>
          <Alert.Info>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Info>
        </>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("InfoIcon");
    });

    it("Renders a Warning alert with default Icon", async () => {
      await render(
        <>
          <Alert.Warning>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Warning>
        </>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("WarningIcon");
    });

    it("Renders a Danger alert with default Icon", async () => {
      await render(
        <>
          <Alert.Danger>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Danger>
        </>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("WarningIcon");
    });

    it("Renders a Success alert with default Icon", async () => {
      await render(
        <>
          <Alert.Success>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("CircleCheckIcon");
    });
  });

  describe("Complex alerts", () => {
    it("Renders an alert with mix of props and children", async () => {
      await render(
        <>
          <Alert.Warning title="This is a title" body="This is a body">
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
            <p>And a paragraph</p>
          </Alert.Warning>
        </>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const heading = page.getByTestId("alert-heading");
      const headingText = await heading.element().textContent;
      expect(headingText).toBe("Test Title");
      
      const bodyElements = document.querySelectorAll("[data-testid='alert-body']");
      const bodyText = bodyElements[0].textContent;
      expect(bodyText).not.toContain("This is a body");
      expect(bodyText).toContain("Test body");
      expect(bodyText).toContain("And a paragraph");
    });

    it("Renders an alert with no icon", async () => {
      await render(
        <>
          <Alert.Success icon={false}>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = document.querySelector("[data-testid='alert-icon']");
      expect(alertIcon).toBeNull();
      
      const heading = page.getByTestId("alert-heading");
      const headingText = await heading.element().textContent;
      expect(headingText).toBe("Test Title");
      
      const bodyElement = document.querySelectorAll("[data-testid='alert-body']")[1];
      const bodyText = bodyElement.textContent;
      expect(bodyText).toContain("Test body");
    });

    it("Renders an alert with default icon", async () => {
      await render(
        <>
          <Alert.Success>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("CircleCheckIcon");
      
      const heading = page.getByTestId("alert-heading");
      const headingText = await heading.element().textContent;
      expect(headingText).toBe("Test Title");
      
      const bodyElement = document.querySelectorAll("[data-testid='alert-body']")[1];
      const bodyText = bodyElement.textContent;
      expect(bodyText).toContain("Test body");
    });

    it("Renders a complex alert with custom icon", async () => {
      await render(
        <>
          <Alert.Warning>
            <Alert.IconWrapper>
              <CircleCheckIcon />
            </Alert.IconWrapper>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Warning>
        </>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const alertIcon = page.getByTestId("alert-icon");
      await expect.element(alertIcon).toBeVisible();
      
      const iconSvg = document.querySelector("[data-testid='alert-icon'] svg");
      expect(iconSvg).toBeTruthy();
      expect(iconSvg?.getAttribute("data-testid")).toBe("CircleCheckIcon");
      
      const heading = page.getByTestId("alert-heading");
      const headingText = await heading.element().textContent;
      expect(headingText).toBe("Test Title");
      
      const bodyElement = document.querySelectorAll("[data-testid='alert-body']")[1];
      const bodyText = bodyElement.textContent;
      expect(bodyText).toContain("Test body");
    });
  });

  describe("Custom heading levels", () => {
    it("Renders an alert with default heading level h2", async () => {
      await render(
        <Alert.Success>
          <Alert.Title>Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const heading = document.querySelector("[data-testid='alert-heading']");
      expect(heading?.tagName).toBe("H2");
    });

    it("Renders an alert with custom heading level H2", async () => {
      await render(
        <Alert.Success>
          <Alert.Title headingTag="h2">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const heading = document.querySelector("[data-testid='alert-heading']");
      expect(heading?.tagName).toBe("H2");
    });

    it("Renders an alert with custom heading level h3", async () => {
      await render(
        <Alert.Success>
          <Alert.Title headingTag="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const heading = document.querySelector("[data-testid='alert-heading']");
      expect(heading?.tagName).toBe("H3");
    });

    it("Renders an alert with custom heading level h4", async () => {
      await render(
        <Alert.Success>
          <Alert.Title headingTag="h4">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const heading = document.querySelector("[data-testid='alert-heading']");
      expect(heading?.tagName).toBe("H4");
    });
  });

  describe("Custom classes", () => {
    it("Renders an alert with custom additional classes", async () => {
      await render(
        <Alert.Success className="gc-testClass">
          <Alert.Title headingTag="h4" className="gc-testHeadingClass">
            Test Title
          </Alert.Title>
          <Alert.Body className="gc-testBodyClass">Test body</Alert.Body>
          <p>And a paragraph</p>
          <>And some text</>
          asdfasdf
        </Alert.Success>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveClass(/gc-testClass/);
      
      const heading = page.getByTestId("alert-heading");
      await expect.element(heading).toBeVisible();
      await expect.element(heading).toHaveClass(/gc-testHeadingClass/);
      
      const bodyElement = document.querySelectorAll("[data-testid='alert-body']")[1];
      expect(bodyElement).toBeTruthy();
      expect(bodyElement.className).toContain("gc-testBodyClass");
    });

    it("Renders an alert with custom override classes", async () => {
      await render(
        <Alert.Success className="mb-8 p-8">
          <Alert.Title headingTag="h4" className="mb-8 pb-8">
            Test Title
          </Alert.Title>
          <Alert.Body className="mt-4">Test body</Alert.Body>
          <p>And a paragraph</p>
          <>And some text</>
        </Alert.Success>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveClass(/p-8/);
      await expect.element(alert).toHaveClass(/mb-8/);
      
      const alertClasses = await alert.element().className;
      expect(alertClasses).not.toContain("p-4");
      
      const heading = page.getByTestId("alert-heading");
      await expect.element(heading).toBeVisible();
      await expect.element(heading).toHaveClass(/mb-8/);
      await expect.element(heading).toHaveClass(/pb-8/);
      
      const headingClasses = await heading.element().className;
      expect(headingClasses).toContain("mb-8");
      expect(headingClasses).toContain("pb-8");
      
      const bodyElement = document.querySelectorAll("[data-testid='alert-body']")[1];
      expect(bodyElement).toBeTruthy();
      expect(bodyElement.className).toContain("mt-4");
    });
  });

  describe("Alert contents", () => {
    it("Renders an alert with Body and additional paragraph", async () => {
      await render(
        <Alert.Success>
          <Alert.Body>Test body</Alert.Body>
          <p>And a paragraph</p>
        </Alert.Success>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const bodyElements = document.querySelectorAll("[data-testid='alert-body']");
      const bodyText = bodyElements[0].textContent;
      expect(bodyText).toContain("Test body");
      expect(bodyText).toContain("And a paragraph");
    });

    it("Renders an alert with arbitrary children", async () => {
      await render(
        <Alert.Success>
          <Alert.Title>This is an Alert</Alert.Title>
          <p>With a paragraph</p>
          <ul>
            <li>And a list</li>
            <li>Another list item</li>
          </ul>
          <>Here is some text wrapped in a fragment</>
          <p>
            This paragraph <Link href="/nowhere">contains a link</Link>.
          </p>
          <Button className="mt-8">And a button</Button>
        </Alert.Success>
      );
      
      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const body = page.getByTestId("alert-body");
      const bodyText = await body.element().textContent;
      expect(bodyText).toContain("With a paragraph");
      expect(bodyText).toContain("Here is some text wrapped in a fragment");
      expect(bodyText).toContain("This paragraph contains a link");
      
      const link = document.querySelector("[data-testid='alert-body'] p a");
      expect(link).toBeTruthy();
      expect(link?.textContent).toContain("contains a link");
      
      const list = document.querySelector("[data-testid='alert-body'] ul");
      expect(list).toBeTruthy();
      expect(list?.textContent).toContain("And a list");
      expect(list?.textContent).toContain("Another list item");
      
      const button = document.querySelector("[data-testid='alert-body'] button");
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain("And a button");
    });

    it("Does not render text that is not contained in an element", async () => {
      await render(
        <Alert.Success>
          <Alert.Body>Test body</Alert.Body>
          <p>And a paragraph</p>
          This text will not render
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const bodyElements = document.querySelectorAll("[data-testid='alert-body']");
      const bodyText = bodyElements[0].textContent;
      expect(bodyText).toContain("Test body");
      expect(bodyText).toContain("And a paragraph");
      expect(bodyText).not.toContain("This text will not render");
    });
  });

  describe("Alert role", () => {
    it("Renders an alert with default role", async () => {
      await render(
        <Alert.Success>
          <Alert.Body>Test body</Alert.Body>
          <p>And a paragraph</p>
          This text will not render
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveAttribute("role", "alert");
    });

    it("Renders an alert with an alternate role", async () => {
      await render(
        <Alert.Success role="note">
          <Alert.Body>Test body</Alert.Body>
          <p>And a paragraph</p>
          This text will not render
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveAttribute("role", "note");
    });
  });

  describe("Alert id", () => {
    it("Does not add an id to the alert by default", async () => {
      await render(
        <Alert.Success role="note">
          <Alert.Body>Test body</Alert.Body>
          <p>And a paragraph</p>
          This text will not render
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      
      const id = await alert.element().getAttribute("id");
      expect(id).toBeNull();
    });

    it("Adds an id to the alert", async () => {
      await render(
        <Alert.Success role="note" id="testId">
          <Alert.Body>Test body</Alert.Body>
          <p>And a paragraph</p>
          This text will not render
        </Alert.Success>
      );

      const alert = page.getByTestId("alert");
      await expect.element(alert).toBeVisible();
      await expect.element(alert).toHaveAttribute("id", "testId");
    });
  });
});
