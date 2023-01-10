describe("TSB Contact Form functionality", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", { isLoading: false, status: false });
    cy.mockForm("../../__fixtures__/tsbDisableFooterGCBranding.json");
  });

  it("TSB Contact Form renders", () => {
    cy.get("h1").contains("Transportation Safety Board of Canada general enquiries");
  });
  it("Form footer does not contain GC branding ", () => {
    cy.get("[data-testid='footer']").find("img").should("not.exist");
  });
});
