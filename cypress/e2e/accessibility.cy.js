import "cypress-each";

const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};

describe("Accessibility (A11Y) Check", () => {
  describe("Form Components", () => {
    it("All components page Accessibility (A11Y) Check", () => {
      cy.mockForm("../../__fixtures__/accessibilityTestForm.json");
      cy.injectAxe();
      cy.checkA11y(null, A11Y_OPTIONS);
    });

    it("Check error state accessibility", () => {
      cy.mockForm("../../__fixtures__/cdsIntakeTestForm.json");
      cy.injectAxe();
      cy.checkA11y(null, A11Y_OPTIONS);
    });
  });
  describe("Unauthenticated Pages", () => {
    it.each([
      { title: "Language selection", path: "/" },
      { title: "Form builder landing", path: "/form-builder" },
      { title: "Form builder edit", path: "/form-builder/edit" },
      { title: "Form builder translation", path: "/form-builder/edit/translate" },
      { title: "Form builder settings", path: "/form-builder/settings" },
      { title: "Terms and conditions", path: "/terms-avis" },
      { title: "Service-level agreement", path: "/sla" },
      { title: "Create an account", path: "/signup/register" },
      { title: "Sign in", path: "/auth/login" },
      { title: "Sign out", path: "/auth/logout" },
    ])(
      (page) => `${page.title} Test`,
      ({ path }) => {
        cy.getCookie("next-auth.session-token").should("not.exist");
        cy.visit(path);
        cy.injectAxe();
        // Ensure page has fully loaded
        cy.get("h1").should("exist");
        cy.checkA11y(null, A11Y_OPTIONS);
      }
    );
  });
  describe("Error Pages", () => {
    it("404 Page", () => {
      cy.visit({ url: "i_do_not_exist_or_should_not", failOnStatusCode: false });
      cy.injectAxe();
      cy.checkA11y(null, A11Y_OPTIONS);
    });
  });
});
