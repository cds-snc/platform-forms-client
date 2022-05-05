describe("TSB Contact Form with security attribute (Protected B)", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.useFlag("reCaptcha", false);
    cy.mockForm("../../tests/data/tsbContactTestFormProtectedB.json");
  });

  it("TSB Contact Form renders", () => {
    cy.get("h1").contains("Protected CDS Intake Form");
  });

  it("Should render the badge", () => {
    cy.get("[data-testid='security-badge']").contains("Protected B when complete");
  });
});
