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
      { title: "Language Selection", path: "/" },
      { title: "Form Builder Landing", path: "/form-builder" },
      { title: "Form Builder Edit", path: "/form-builder/edit" },
      { title: "Form Builder Translation", path: "/form-builder/edit/translate" },
      { title: "FormBuilder Settings", path: "/form-builder/settings" },
      { title: "Terms and Conditions", path: "/terms-avis" },
      { title: "Service Level Agreement", path: "/sla" },
      { title: "Registration", path: "/signup/register" },
      { title: "Login", path: "/auth/login" },
      { title: "Logout", path: "/auth/logout" },
    ])(
      (page) => `${page.title} Test`,
      ({ path }) => {
        cy.visit(path);
        cy.injectAxe();
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
