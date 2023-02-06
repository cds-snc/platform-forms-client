/** TODO
 * Hard to find a  proper way to hack requireAuthentication
 * wrapper around policy and retrieval page.We will keep this file
 * for reference until we figure out.

describe("Test acceptable use Page", () => {
  beforeEach(() => {
    cy.visit("/en/auth/policy", {
      onBeforeLoad: (win) => {
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
  it.skip("En page renders proprerly", () => {
    cy.get("h1").should("contain", "Welcome back");
    cy.get(".gc-agree-btn").should("be.visible");
    cy.get(".gc-cancel-btn").should("be.visible");
    cy.get(".gc-acceptable-use-header").should("be.visible");
  });

  it.skip("Fr page renders properly", () => {
    cy.get("a[lang='fr']").click();
    cy.url().should("contain", "/fr");
    cy.get("h1").should("contain", "Content de vous revoir");
    cy.get(".gc-agree-btn").should("be.visible");
    cy.get(".gc-cancel-btn").should("be.visible");
    cy.get(".gc-acceptable-use-header").should("be.visible");
  });
});

describe("Test agree and disagree on terms of use", () => {
  beforeEach(() => {
    cy.visit("/en/auth/policy");
  });

  it.skip("disagree on terms of use", () => {
    cy.get(".gc-cancel-btn").click();
    cy.url().should("contain", "/logout");
  });

  it.skip("Agree on terms of use", () => {
    cy.get(".gc-agree-btn").click();
    cy.url().should("contain", "/id/");
  });
});

 **/
