const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};
describe("Accessibility (A11Y) Check", () => {
  it("Welcome Page Passes accessibility tests", () => {
    cy.visit("http://localhost:3000/en");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });
  it("CDS Intake Form Passes accessibility tests", () => {
    cy.visit("http://localhost:3000/en/2");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });
});
