import { ignoreExceptions } from "../utils";

describe("Landing page", () => {
  ignoreExceptions();

  it("English page loads", () => {
    cy.visitPage("/");
    cy.get("h1").should("contain", "GC Forms");
  });

  it("French page loads", () => {
    cy.visitPage("/fr");
    cy.get("h1").should("contain", "Formulaires GC - GC Forms");
  });
});
