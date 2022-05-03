describe("TSB Contact Form with security attribute (Protected B) enable", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.mockForm("../../tests/data/tsbContactTestFormProtectedB.json");
  });

  it("TSB Contact Form renders", () => {
    cy.get("h1").contains("Protected B Transportation Safety Board of Canada general enquiries");
  });
  it("Check that the badge is rendered correctly", () => {
    cy.get("#security-attribute-content").contains("Protected B when complete");
  });
});
