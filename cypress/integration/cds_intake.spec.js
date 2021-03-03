describe("CDS Intake Form functionality", { baseUrl: "http://localhost:3000" }, () => {
  it("CDS Intake Form renders", () => {
    cy.visit("/en/1");
    cy.get("h1").contains("CDS Intake Form");
  });
  it("Fill out the form", () => {
    cy.get("input[id='1']").type("Santa").should("have.value", "Santa");
    cy.get("input[id='2']")
      .type("santa@northpole.global")
      .should("have.value", "santa@northpole.global");
    cy.get("input[id='3']").type("Self-Employed").should("have.value", "Self-Employed");
    cy.get("input[id='4']").type("Global Delivery").should("have.value", "Global Delivery");
    cy.get("textarea[id='5']")
      .type("How can I better stream line letters from children.")
      .should("have.value", "How can I better stream line letters from children.");
    cy.get("input[id='6']").type("December 25, 2021").should("have.value", "December 25, 2021");
    cy.get("textarea[id='7']")
      .type(
        "Canadian Digital Service has been in the news so much lately because of the COVID Alert App."
      )
      .should(
        "have.value",
        "Canadian Digital Service has been in the news so much lately because of the COVID Alert App."
      );
  });
  it("Submit the Form", () => {
    cy.get("button").contains("Submit").click();
    cy.url().should("include", "/confirmation");
  });
});
