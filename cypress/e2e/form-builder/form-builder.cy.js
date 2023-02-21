describe("Test FormBuilder", () => {
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
    cy.visit("/form-builder/edit");
    cy.get("#formTitle").type("Cypress Test Form");
    cy.get("a").contains("Edit").should("have.class", "font-bold");
    cy.get(`[aria-label="Form introduction"]`).type("form intro");
    cy.get("button").contains("Add block").click();

    cy.get("li").contains("Single choice").click();
    cy.get("button").contains("Select block").click();

    cy.get("#item0").type("Question 1");
    cy.get("#option--0--1").type("option 1");
    cy.get("button").contains("Add an option").click();
    cy.get("#option--0--2").type("option 2");
    cy.get(`[aria-label="Privacy statement"]`).type("privacy statement");
    cy.get(`[aria-label="Confirmation page and message"]`).type("confirmation page");
    cy.get("#item0").click();
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
    cy.get("a").contains("Preview").click();
    cy.get("a").contains("Preview").should("have.class", "font-bold");
    cy.get("#content h1").should("contain", "Cypress Test Form");
    cy.get(".gc-richText p").should("contain", "form intro");
    cy.get("#label-1").should("contain", "Question 1-1");
    cy.get("#desc-1").should("contain", "Question 1 description");
    cy.get(".gc-input-radio").first().should("contain", "option 1");
    cy.get("#PreviewSubmitButton").should(
      "contain",
      "Sign in to test how you can submit and view responses"
    );

    // settings
    cy.get("a").contains("Settings").click();
    cy.get("a").contains("Settings").should("have.class", "font-bold");
    cy.get("h1").should("contain", "Form settings");
    cy.get("label").contains("Response delivery destination");

    // publish form
    cy.get("a").contains("Publish").click();
    cy.get("a").contains("Publish").should("have.class", "font-bold");
    cy.get("h1").should("contain", "Sign in to publish your form");
    cy.get("a").contains("create one").click();

    // can visit create account
    cy.url().should("contain", "/signup/register");
  });
});
