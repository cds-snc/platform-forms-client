describe("TSB Contact Form functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/tsbDisableFooterGCBranding.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => cy.visitForm(formID));

  it("TSB Contact Form renders", () => {
    cy.get("h1").contains("Transportation Safety Board of Canada general enquiries");
  });
  it("Form footer does not contain GC branding ", () => {
    cy.get("[data-testid='footer']").find("img").should("not.exist");
  });
});
