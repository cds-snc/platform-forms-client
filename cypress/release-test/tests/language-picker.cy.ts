import { FORM_ID_SINGLE_PAGE } from "../includes";
import { ignoreExceptions } from "../utils";

describe("Single Page Form", () => {
  ignoreExceptions();

  beforeEach(() => {
    cy.visitPage(`/en/id/${FORM_ID_SINGLE_PAGE}`);
  });

  it("Shows header language picker, title and footer in EN and FR", () => {
    cy.get("header").should("contain", "Français");
    cy.get("footer").should("contain", "Terms and conditions");
    cy.get("header").find("a").contains("Français").click();
    cy.get("header").should("contain", "English");
    cy.get("h1").should("contain", "[FR]test-kitchen-sink-single-page");
    cy.get("footer").should("contain", "Conditions générales");
  });
});
