describe("Test acceptable use Page", () => {
  beforeEach(() => {
    cy.visit("/form-builder", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
        let nextData;
        Object.defineProperty(win, "__NEXT_DATA__", {
          set(serverSideProps) {
            serverSideProps.context = {
              user: {
                acceptableUse: false,
                name: null,
                userId: "testId",
              },
            };
            nextData = serverSideProps;
          },
          get() {
            return nextData;
          },
        });
      },
    });
  });

  it("Renders form builder home page", () => {
    cy.get("h2").should("contain", "Design a form");
    cy.get("h2").should("contain", "Open a form file");
    cy.get("a[lang='fr']").click();
    cy.get("h2").should("contain", "Créer un formulaire");
    cy.get("h2").should("contain", "Ouvrir un formulaire");
  });

  it("Designs a form", () => {
    cy.get("h2").first().click();
    cy.get("#formTitle").type("Cypress Test Form");
    cy.get(`[aria-label="Form introduction"]`).type("form intro");
    cy.get("button").contains("Add element").click();
    cy.get("#item0").type("Question 1");
    cy.get("#option--0--1").type("option 1");
    cy.get("button").contains("Add an option").click();
    cy.get("#option--0--2").type("option 2");
    cy.get(`[aria-label="Privacy statement"]`).type("privacy statement");
    cy.get(`[aria-label="Confirmation page and message"]`).type("confirmation page");
    cy.get("button").contains("More").click();

    // open modal
    cy.get("h2").should("contain", "More options");
    cy.get("#title--modal--0").should("have.value", "Question 1");
    cy.get("#title--modal--0").type("-1");
    cy.get("#description--modal--0").type("Question 1 description");
    cy.get("#required-0-id-modal").click();
    cy.get(".modal-content button").contains("Save").click({ force: true });

    // re-check form editor
    cy.get("#item0").scrollIntoView().should("have.value", "Question 1-1");
    cy.get("#item0-describedby").should("contain", "Question 1 description");
    cy.get("#required-0-id").should("be.checked");

    // preview form
    cy.get("button").contains("Preview").click();
    cy.get("#content h1").should("contain", "Cypress Test Form");
    cy.get(".gc-richText p").should("contain", "form intro");
    cy.get("#label-1").should("contain", "Question 1-1");
    cy.get("#desc-1").should("contain", "Question 1 description");
    cy.get(".gc-input-radio").first().should("contain", "option 1");
    cy.get(".buttons div").should("contain", "Form submission is disabled in preview");

    // share form
    cy.get("button").contains("Share").click();
    cy.get("h1").should("contain", "Share your form");

    // save form
    cy.get("button").contains("Save").click();
    cy.get("h1").should("contain", "Save your progress");

    // publish form
    cy.get("button").contains("Publish").click();
    cy.get("h1").should("contain", "Sign in to publish your form");
    cy.get("a").contains("create one").click();

    // can visit create account
    cy.url().should("contain", "/signup/register");
  });
});
