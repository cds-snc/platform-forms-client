describe("Test RichTextEditor", () => {
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

  it("Can add some text and a link", () => {
    // Setup a form with one question
    cy.get("h2").first().click();

    cy.get(`[aria-label="Form introduction"]`).type("Here's some text").setSelection("some text");
    cy.get('[data-testid="link-button"]').first().click();

    cy.get('[data-testid="link-editor"]').first().click().type("example.com{enter}");

    cy.get('[id^="editor-"] a').first().contains("some text");
  });

  it("Can add some text and add styling", () => {
    cy.get("h2").first().click();

    cy.get(`[aria-label="Form introduction"]`)
      .type("H2 heading text{enter}")
      .type("H3 heading text{enter}")
      .type("Let's bold part of this sentence.{enter}")
      .type("Let's italicize part of this sentence.{enter}");

    cy.get(`[aria-label="Form introduction"]`).setSelection("H2 heading text");
    cy.get('[data-testid="h2-button"]').first().click();
    cy.get('[id^="editor-"] h2').first().contains("H2 heading text");

    cy.get(`[aria-label="Form introduction"]`).setSelection("H3 heading text");
    cy.get('[data-testid="h3-button"]').first().click();
    cy.get('[id^="editor-"] h3').first().contains("H3 heading text");

    cy.get(`[aria-label="Form introduction"]`).setSelection("bold part of this");
    cy.get('[data-testid="bold-button"]').first().click();
    cy.get('[id^="editor-"] strong').first().contains("bold part of this");

    cy.get(`[aria-label="Form introduction"]`).setSelection("italicize part of this");
    cy.get('[data-testid="italic-button"]').first().click();
    cy.get('[id^="editor-"] em').first().contains("italicize part of this");
  });
});
