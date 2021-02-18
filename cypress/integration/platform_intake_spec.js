describe(
  "CDS Platform Intake Form functionality",
  { baseUrl: "http://localhost:3000" },
  () => {
    it("CDS Platform Intake Form renders", () => {
      cy.visit("/en/20");
      cy.get("h1").contains("CDS Platform Intake Form");
    });
    it("Fill out the form", () => {
      cy.get("input[id='2']").type("Santa").should("have.value", "Santa");
      cy.get("input[id='3']")
        .type("santa@northpole.global")
        .should("have.value", "santa@northpole.global");
      cy.get("input[id='4']")
        .type("CDS Gifts")
        .should("have.value", "CDS Gifts");
      cy.get("input[id=5]")
        .type("1 877-636-0656")
        .should("have.value", "1 877-636-0656");
      cy.get(".gc-checkbox-label").click({ multiple: true });
      cy.get("textarea[id='7']")
        .type("More emails: santa1@northpole.global, santa2@northpole.global")
        .should(
          "have.value",
          "More emails: santa1@northpole.global, santa2@northpole.global"
        );
    });
    it("Submit the Form", () => {
      cy.get("button").contains("Submit").click();
      cy.url().should("include", "/confirmation");
    });
  }
);
