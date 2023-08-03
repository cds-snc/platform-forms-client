import React from "react";
import * as Alert from "./Alert";
import { CircleCheckIcon, CopyIcon } from "../../form-builder/icons";

describe("<Alert />", () => {
  describe("Alerts by status", () => {
    it("Renders a SUCCESS alert", () => {
      cy.mount(<Alert.Success title="This is a title" body="This is a body" />);
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert']").should("have.class", "bg-emerald-50");
      cy.get("[data-testid='alert-icon']").should("have.class", "[&_svg]:fill-emerald-700");
      cy.get("[data-testid='alert-heading']").should("have.class", "text-emerald-700");
    });

    it("Renders a WARNING alert", () => {
      cy.mount(<Alert.Warning title="This is a title" body="This is a body" />);
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert']").should("have.class", "bg-yellow-50");
      cy.get("[data-testid='alert-icon']").should("have.class", "[&_svg]:fill-slate-950");
      cy.get("[data-testid='alert-heading']").should("have.class", "text-slate-950");
    });

    it("Renders am INFO alert", () => {
      cy.mount(<Alert.Info title="This is a title" body="This is a body" />);
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert']").should("have.class", "bg-indigo-50");
      cy.get("[data-testid='alert-icon']").should("have.class", "[&_svg]:fill-slate-950");
      cy.get("[data-testid='alert-heading']").should("have.class", "text-slate-950");
    });

    it("Renders am DANGER alert", () => {
      cy.mount(<Alert.Danger title="This is a title" body="This is a body" />);
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert']").should("have.class", "bg-red-50");
      cy.get("[data-testid='alert-icon']").should("have.class", "[&_svg]:fill-red-700");
      cy.get("[data-testid='alert-heading']").should("have.class", "text-red-700");
    });
  });

  describe("Alerts using props", () => {
    it("Renders a basic alert with title, body, and custom icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <Alert.Success
          title="This is a title"
          body="This is a body"
          icon={<CircleCheckIcon className="mr-1 h-12 w-12" />}
        />
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg").should("exist");

      cy.get("[data-testid='alert'] h2").should("have.text", "This is a title");
      cy.get("[data-testid='alert']").should("contain", "This is a body");
    });

    it("Renders a basic alert with title, body, and default icon", () => {
      cy.viewport(1000, 400);
      cy.mount(<Alert.Warning title="This is a title" body="This is a body" />);

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg").should("exist");

      cy.get("[data-testid='alert'] h2").should("have.text", "This is a title");
      cy.get("[data-testid='alert']").should("contain", "This is a body");
    });

    it("Renders a basic alert with title, body, and no icon", () => {
      cy.viewport(1000, 400);
      cy.mount(<Alert.Warning title="This is a title" body="This is a body" icon={false} />);

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("not.exist");

      cy.get("[data-testid='alert'] h2").should("have.text", "This is a title");
      cy.get("[data-testid='alert']").should("contain", "This is a body");
    });
  });

  describe("Dismissible alerts", () => {
    it("Renders a dismissible alert", () => {
      cy.mount(<Alert.Success dismissible title="This is a title" body="This is a body" />);
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-dismiss']").should("exist").click();
      cy.get("[data-testid='alert']").should("not.exist");
    });

    // @TODO: fix this test
    it.skip("Renders a dismissible alert with custom dismiss action", () => {
      const onDismissHandler = cy.stub();
      cy.mount(
        <Alert.Success
          dismissible
          onDismiss={onDismissHandler}
          title="This is a title"
          body="This is a body"
        />
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-dismiss']").should("exist").click();
      expect(onDismissHandler).to.be.calledOnce;
    });
  });

  describe("Complex alerts", () => {
    it("Renders an alert with mix of props and children", () => {
      cy.viewport(1000, 400);
      // Title prop should be overridden by child Alert.Title
      // Para text should be appended after body prop
      // Default icon should be used
      cy.mount(
        <>
          <Alert.Warning title="This is a title" body="This is a body">
            <Alert.Title headingTag="h3">Test Title</Alert.Title>
            <p>And a paragraph</p>
          </Alert.Warning>
        </>
      );
    });

    it("Renders an alert with default Icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Info>
            <Alert.Title headingTag="h3">Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
            Just some text
            <p>And a paragraph</p>
          </Alert.Info>
        </>
      );
    });

    it("Renders an alert with no icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Success icon={false}>
            <Alert.Title headingTag="h3">Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
    });

    it("Renders an alert with default icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Success>
            <Alert.Title headingTag="h3">Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
    });

    it("Renders a complex alert with custom icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Success>
            <Alert.Icon>
              <CircleCheckIcon />
            </Alert.Icon>
            <Alert.Title headingTag="h3">Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
    });

    it("Renders a complex alert", () => {
      cy.mount(
        <Alert.Success>
          <Alert.Icon>
            <CircleCheckIcon />
          </Alert.Icon>
          <Alert.Title headingTag="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
          Just some text
          <p>And a paragraph</p>
        </Alert.Success>
      );
    });
  });
});
