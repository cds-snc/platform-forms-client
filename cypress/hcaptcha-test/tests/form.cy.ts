import { ignoreExceptions } from "hcaptcha-test/utils";

const formTimer = false;

describe("Single Page Form", () => {
  ignoreExceptions();

  beforeEach(() => {
    cy.visitPage(`/`);
  });

  it("Page loads", () => {
    cy.get("h1").should("contain", "Automated hCaptcha Test Form (do not delete)");
  });

  it("hCaptcha detects this request as a bot", () => {
    cy.typeInField("#1", "test");
    cy.get("button[type='submit']").click();

    // Wait for the form timer to show then click it
    if (formTimer) {
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();
    }

    // Fails sending the "user" to the fail page
    cy.get("h2").should("contain", "Your form could not be submitted");
  });
});
