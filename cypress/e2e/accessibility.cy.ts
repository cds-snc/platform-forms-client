import "cypress-each";
import { Options } from "cypress-axe";

const A11Y_OPTIONS: Options = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};

describe("Accessibility (A11Y) Check", () => {
  describe("Form Components", () => {
    it("All components page Accessibility (A11Y) Check", () => {
      cy.useForm("../../__fixtures__/accessibilityTestForm.json");
      cy.get<string>("@formID").then((formID) => cy.visitForm(formID));
      cy.injectAxe();
      cy.checkA11y(undefined, A11Y_OPTIONS);
    });

    it("Check error state accessibility", () => {
      cy.useForm("../../__fixtures__/cdsIntakeTestForm.json");
      cy.get<string>("@formID").then((formID) => cy.visitForm(formID));
      cy.injectAxe();
      cy.checkA11y(undefined, A11Y_OPTIONS);
    });
  });
  describe("Unauthenticated Pages", () => {
    it.each([
      { title: "Language selection", path: "/" },
      { title: "Form builder landing", path: "/en/form-builder" },
      { title: "Form builder edit", path: "/en/form-builder/0000/edit" },
      { title: "Form builder translation", path: "/en/form-builder/0000/edit/translate" },
      { title: "Form builder settings", path: "/en/form-builder/0000/settings" },
      { title: "Terms and conditions", path: "/en/terms-and-conditions" },
      { title: "Service-level agreement", path: "/en/sla" },
      { title: "Create an account", path: "/en/auth/register" },
      { title: "Sign in", path: "/en/auth/login" },
      { title: "Sign out", path: "/en/auth/logout" },
    ])(
      (page) => `${page.title} Test`,
      ({ path }) => {
        // There should not be a user logged in
        cy.getCookie("authjs.session-token").should("not.exist");
        cy.visitPage(path);
        cy.injectAxe();
        // Ensure page has fully loaded
        cy.get("h1").should("be.visible");
        cy.checkA11y(undefined, A11Y_OPTIONS);
      }
    );
  });
  describe("Error Pages", () => {
    it("404 Page", () => {
      cy.visit({ url: "i_do_not_exist_or_should_not", failOnStatusCode: false });
      // Ensure page has fully loaded
      cy.get("h1").should("be.visible");
      cy.injectAxe();
      cy.checkA11y(undefined, A11Y_OPTIONS);
    });
  });
});
