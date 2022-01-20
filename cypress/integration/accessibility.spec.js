const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};

describe("Accessibility (A11Y) Check", () => {
  it("Welcome Page Passes accessibility tests", () => {
    cy.visit("/en/welcome-bienvenue");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it("Published Form pages Accessibility (A11Y) Check", () => {
    let forms = [];
    const body = {
      method: "GET",
    };
    cy.request("/api/templates", JSON.stringify(body))
      .then((response) => {
        response.body.data.records.forEach((rec) => {
          if (rec.formConfig.publishingStatus) {
            forms.push(rec.formID);
          }
        });
      })
      .wrap(forms)
      .each((form) => {
        cy.visit(`/en/id/${form}`);
        cy.injectAxe();
        cy.checkA11y(null, A11Y_OPTIONS);
      });
  });
});

/*
          cy.log(form);
          cy.visit(`/en/id/${form.formID}`);
          cy.injectAxe();
          cy.checkA11y(null, A11Y_OPTIONS);
          */
