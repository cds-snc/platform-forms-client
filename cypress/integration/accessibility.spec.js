const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};
describe("Accessibility (A11Y) Check", { baseUrl: "http://localhost:3000" }, () => {
  it("Welcome Page Passes accessibility tests", () => {
    cy.visit("/en");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });
  it("CDS Platform Intake Form Passes accessibility tests", () => {
    cy.visit("/en/20");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });
});
