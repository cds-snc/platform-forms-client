describe("Test FormBuilder language switching", () => {
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

  it("Can enter English and French text in Introduction", () => {
    // Setup a form with one question
    cy.get("h2").first().click();

    cy.get(`[aria-label="Form introduction"]`).type("Here's some text").setSelection("some text");
    cy.get('[data-testid="link-button"]').click();

    cy.get('[data-testid="link-editor"]').click().type("example.com{enter}");

    cy.get('[id^="editor-"] a').contains("some text");
  });
});
