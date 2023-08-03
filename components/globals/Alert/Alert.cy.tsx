import React from "react";
import * as Alert from "./Alert";
import { CircleCheckIcon } from "../../form-builder/icons";

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
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "WarningIcon");

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
    it("Renders a dismissible alert with custom dismiss action", () => {
      // const onDismissHandler = cy.stub();
      let called = false;
      const onDismissHandler = () => {
        called = true;
      };

      cy.mount(
        <Alert.Success
          dismissible
          onDismiss={onDismissHandler}
          title="This is a title"
          body="This is a body"
        />
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-dismiss']").click();
      cy.get("[data-testid='alert-dismiss']").then(() => {
        expect(called).to.be.true;
      });
    });
  });

  describe("Focussable alerts", () => {
    it("Renders a focussable alert", () => {
      cy.mount(<Alert.Success focussable title="This is a title" body="This is a body" />);
      cy.get("[data-testid='alert']").should("exist");
      cy.focused().should("have.attr", "data-testid", "alert");
    });
  });

  describe("Default icons", () => {
    it("Renders an Info alert with default Icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Info>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Info>
        </>
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "InfoIcon");
    });

    it("Renders a Warning alert with default Icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Warning>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Warning>
        </>
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "WarningIcon");
    });

    it("Renders a Danger alert with default Icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Danger>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Danger>
        </>
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "WarningIcon");
    });

    it("Renders a Success alert with default Icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Success>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "CircleCheckIcon");
    });
  });

  describe("Complex alerts", () => {
    it("Renders an alert with mix of props and children", () => {
      cy.viewport(1000, 400);
      // Title prop should be overridden by child Alert.Title
      // Body prop should be overridden by child Alert.Body
      // Para text should be appended after body prop
      // Default icon should appear
      cy.mount(
        <>
          <Alert.Warning title="This is a title" body="This is a body">
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
            <p>And a paragraph</p>
          </Alert.Warning>
        </>
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-heading']").should("have.text", "Test Title");
      cy.get("[data-testid='alert-body']").should("not.contain", "This is a body");
      cy.get("[data-testid='alert-body']").should("contain", "Test body");
      cy.get("[data-testid='alert-body']").should("contain", "And a paragraph");
    });

    it("Renders an alert with no icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Success icon={false}>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("not.exist");
      cy.get("[data-testid='alert-heading']").should("have.text", "Test Title");
      cy.get("[data-testid='alert-body']").should("contain", "Test body");
    });

    it("Renders an alert with default icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Success>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Success>
        </>
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "CircleCheckIcon");
      cy.get("[data-testid='alert-heading']").should("have.text", "Test Title");
      cy.get("[data-testid='alert-body']").should("contain", "Test body");
    });

    it("Renders a complex alert with custom icon", () => {
      cy.viewport(1000, 400);
      cy.mount(
        <>
          <Alert.Warning>
            <Alert.Icon>
              <CircleCheckIcon />
            </Alert.Icon>
            <Alert.Title>Test Title</Alert.Title>
            <Alert.Body>Test body</Alert.Body>
          </Alert.Warning>
        </>
      );
      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-icon']").should("exist");
      cy.get("[data-testid='alert-icon'] svg")
        .should("exist")
        .should("have.attr", "data-testid", "CircleCheckIcon");
      cy.get("[data-testid='alert-heading']").should("have.text", "Test Title");
      cy.get("[data-testid='alert-body']").should("contain", "Test body");
    });
  });

  describe("Custom heading levels", () => {
    it("Renders an alert with default heading level h2", () => {
      cy.mount(
        <Alert.Success>
          <Alert.Title>Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-heading']").should("have.prop", "tagName", "H2");
    });

    it("Renders an alert with custom heading level H2", () => {
      cy.mount(
        <Alert.Success>
          <Alert.Title headingTag="h2">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-heading']").should("have.prop", "tagName", "H2");
    });

    it("Renders an alert with custom heading level h3", () => {
      cy.mount(
        <Alert.Success>
          <Alert.Title headingTag="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-heading']").should("have.prop", "tagName", "H3");
    });

    it("Renders an alert with custom heading level h4", () => {
      cy.mount(
        <Alert.Success>
          <Alert.Title headingTag="h4">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      );

      cy.get("[data-testid='alert']").should("exist");
      cy.get("[data-testid='alert-heading']").should("have.prop", "tagName", "H4");
    });
  });

  describe("Custom classes", () => {
    it("Renders an alert with custom additional classes", () => {
      cy.mount(
        <Alert.Success className="testClass">
          <Alert.Title headingTag="h4" className="testHeadingClass">
            Test Title
          </Alert.Title>
          <Alert.Body className="testBodyClass">Test body</Alert.Body>
          <p>And a paragraph</p>
          <>And some text</>
          asdfasdf
        </Alert.Success>
      );
      cy.get("[data-testid='alert']").should("exist").should("have.class", "testClass");
      cy.get("[data-testid='alert-heading']")
        .should("exist")
        .should("have.class", "testHeadingClass");
      cy.get("[data-testid='alert-body']").should("exist").should("have.class", "testBodyClass");
    });

    it("Renders an alert with custom override classes", () => {
      cy.mount(
        <Alert.Success className="mb-8 p-8">
          <Alert.Title headingTag="h4" className="mb-8 pb-8">
            Test Title
          </Alert.Title>
          <Alert.Body className="mt-4">Test body</Alert.Body>
          <p>And a paragraph</p>
          <>And some text</>
          asdfasdf // will not render
        </Alert.Success>
      );
      cy.get("[data-testid='alert']")
        .should("exist")
        .should("have.class", "p-8") // Override class
        .should("have.class", "mb-8") // Additional class
        .should("not.have.class", "p-4"); // The p-8 class will override the default p-4 class
      cy.get("[data-testid='alert-heading']")
        .should("exist")
        .should("have.class", "mb-8") // Override class
        .should("have.class", "pb-8") // Override class
        .should("not.have.class", "mb-0") // The mb-8 class will override the default mb-0 class
        .should("not.have.class", "pb-0"); // The pb-8 class will override the default pb-0 class
      cy.get("[data-testid='alert-body']").should("exist").should("have.class", "mt-4"); // Additional class
    });
  });
});
