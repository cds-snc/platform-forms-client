const FORM_ID_SINGLE_PAGE = "cm9h879wr007byn01fswmm9f3"; // staging = "cm9ha7ldb0001x701vocmtevr"
const FORM_ID_MULTI_PAGE = "cm9hg5nk6009rxa01dde41xes"; // staging = "cm9hnmdwm0001vo0111lakpdw"

describe("Production Release Test", async () => {
  // TODO: remove or disable when form-timer removed
  const formTimer = true;
  const clickFormTimer = () => {
    if (formTimer) {
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();
    }
  };

  Cypress.on("uncaught:exception", (err) => {
    // See https://docs.cypress.io/api/cypress-api/catalog-of-events#Uncaught-Exceptions
    if (err.message.includes("Minified React error #418")) {
      return false;
    }
  });

  describe("Landing page", () => {
    it("English page loads", () => {
      cy.visitPage("/");
      cy.get("h1").should("contain", "GC Forms");
    });

    it("French page loads", () => {
      cy.visitPage("/fr");
      cy.get("h1").should("contain", "Formulaires GC - GC Forms");
    });
  });

  describe("Single Page Form", () => {
    beforeEach(() => {
      cy.visitPage(`/en/id/${FORM_ID_SINGLE_PAGE}`);
    });

    it("Shows header language picker, title and footer", () => {
      cy.get("header").should("contain", "Français");
      cy.get("h1").should("contain", "test-kitchen-sink-single-page");
      cy.get("footer").should("contain", "Terms and conditions");
    });

    it("Missing required questions or invalid input causes form validation to show", () => {
      cy.typeInField("#16", "invalid@email");
      // Date
      cy.get("#13-year").type("1");
      cy.get("#13-month").type("1");
      cy.get("#13-day").type("1");
      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h2").should("contain", "Please correct the errors on the page");
      cy.get("#errorMessage16").should("contain", "Enter a valid email address");
      cy.get("#errorMessage13").should("contain", "Enter a valid date");
    });

    it("Filling only required fields succeeds", () => {
      // Attestation
      cy.get("div[data-testid='7.0']").find("label").click();
      cy.get("div[data-testid='7.1']").find("label").click();
      cy.get("div[data-testid='7.2']").find("label").click();

      // Name and Full name
      cy.typeInField("#8", "full name");
      cy.typeInField("#10", "first");
      cy.typeInField("#12", "last");

      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h1").should("contain", "Your form has been submitted");
    });

    it("Filling all fields succeeds", () => {
      cy.typeInField("#1", "test");
      cy.typeInField("#2", "test");
      cy.get("label[for='3.0']").click();
      cy.get("label[for='4.0']").click();
      cy.get("#5").select("B").should("have.value", "B");

      // Show hide
      cy.get("label[for='26.0']").click();
      cy.get("#label-27").should("contain", "Question A");
      cy.get("label[for='26.1']").click();
      cy.get("#label-28").should("contain", "Question B");

      // Attestation
      cy.get("div[data-testid='7.0']").find("label").click();
      cy.get("div[data-testid='7.1']").find("label").click();
      cy.get("div[data-testid='7.2']").find("label").click();

      // Name and Full name
      cy.typeInField("#8", "full name");
      cy.typeInField("#10", "first");
      cy.typeInField("#11", "first");
      cy.typeInField("#12", "last");

      // Date
      cy.get("#13-year").type("2023");
      cy.get("#13-month").type("01");
      cy.get("#13-day").type("01");

      // Contact
      cy.typeInField("#15", "TODO Phone number may want to restrict more");
      cy.typeInField("#16", "valid@email.com");
      cy.get("label[for='17.0']").click();

      // Address
      cy.typeInField("#19", "Street");
      cy.typeInField("#20", "City");
      cy.typeInField("#21", "Province");
      cy.typeInField("#22", "Postal code");

      // Department
      cy.typeInField("#23", "Accessibility Standards Canada").should(
        "have.value",
        "Accessibility Standards Canada"
      );

      // Number
      cy.typeInField("#24", "123");

      // TODO - file picker?

      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h1").should("contain", "Your form has been submitted");
    });
  });

  describe("Multi-Page Form", () => {
    beforeEach(() => {
      cy.visitPage(`/en/id/${FORM_ID_MULTI_PAGE}`);
    });

    it("Shows header language picker, title and footer", () => {
      cy.get("header").should("contain", "Français");
      cy.get("h1").should("contain", "test-kitchen-sink-multi-page");
      cy.get("footer").should("contain", "Terms and conditions");
    });

    it("Missing required questions or invalid input causes form validation to show", () => {
      cy.get("span").contains("Continue").parent().click();

      // Applicant Information page
      cy.get("h2").should("contain", "Applicant Information");
      cy.get("span").contains("Continue").parent().click();
      cy.get("h2").should("contain", "Please correct the errors on the page");
    });

    it("Filling only required fields succeeds", () => {
      cy.get("span").contains("Continue").parent().click();

      // Applicant Information page
      cy.get("h2").should("contain", "Applicant Information");
      cy.typeInField("#16", "first");
      cy.typeInField("#18", "last");
      cy.typeInField("#20", "Accessibility Standards Canada").should(
        "have.value",
        "Accessibility Standards Canada"
      );

      cy.get("span").contains("Continue").parent().click();

      cy.get("label[for='22.0']").click();

      // Next next...
      cy.get("span").contains("Continue").parent().click();
      cy.get("span").contains("Continue").parent().click();
      cy.get("span").contains("Continue").parent().click();
      cy.get("span").contains("Continue").parent().click();

      cy.get("h2").should("contain", "Review your answers before submitting the form");

      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h1").should("contain", "Your form has been submitted");
    });

    it("Filling all fields succeeds", () => {
      cy.get("span").contains("Continue").parent().click();

      //
      // Page 1 - Applicant Information page
      //

      cy.get("h2").should("contain", "Applicant Information");
      cy.typeInField("#16", "first");
      cy.typeInField("#17", "middle");
      cy.typeInField("#18", "last");
      cy.typeInField("#19", "alternate");

      // Contact
      cy.typeInField("#3", "123");
      cy.typeInField("#4", "test@test.com");
      cy.get("label[for='5.0']").click();

      // DOB
      cy.get("#6-year").type("2023");
      cy.get("#6-month").type("01");
      cy.get("#6-day").type("01");

      // Date of submission
      cy.get("#21-year").type("2023");
      cy.get("#21-month").type("01");
      cy.get("#21-day").type("01");

      cy.typeInField("#20", "Accessibility Standards Canada").should(
        "have.value",
        "Accessibility Standards Canada"
      );

      cy.get("span").contains("Continue").parent().click();

      //
      // Page 2 - Eligibility Criteria
      //

      //#22 - Are you applying as an.. intentionally left blank for testing an empty response

      cy.get("label[for='22.0']").click();

      cy.get("span").contains("Continue").parent().click();

      //
      // Page 3 - Application Details
      //

      cy.get("#28").select("Employment").should("have.value", "Employment");
      cy.typeInField("#29", "request in detail");
      cy.get("label[for='30.0']").click();
      cy.get("label[for='30.1']").click();

      cy.get("span").contains("Continue").parent().click();

      //
      // Page 4 - Additional Information - Funding Support
      //

      cy.typeInField("#32", "1");
      cy.typeInField("#33", "Justification for Funding");
      cy.get("label[for='34.0']").click();
      cy.typeInField("#38", "application 12345");

      cy.get("span").contains("Continue").parent().click();

      //
      // Page 5 - Repeating Sets
      //

      cy.typeInField("input[name='36.0.0']", "Full name1");
      cy.typeInField("input[name='36.0.1']", "1");
      cy.typeInField("textarea[name='36.0.2']", "Primary Responsibilities1");
      cy.get("select[name='36.0.3']")
        .select("Less than 1 year")
        .should("have.value", "Less than 1 year");

      cy.get("button").contains("Add another team member").click();

      cy.typeInField("input[name='36.1.0']", "Full name2");
      cy.typeInField("input[name='36.1.1']", "2");
      cy.typeInField("textarea[name='36.1.2']", "Primary Responsibilities2");
      cy.get("select[name='36.1.3']")
        .select("Less than 1 year")
        .should("have.value", "Less than 1 year");

      cy.get("span").contains("Continue").parent().click();

      //
      // Review Page - check all the answers
      //

      cy.get("h2").should("contain", "Review your answers before submitting the form");

      // Page 1
      cy.get("button").contains("Applicant Information");
      cy.get("dt").contains("First name").siblings("dd").contains("first");
      cy.get("dt").contains("Middle name").siblings("dd").contains("middle");
      cy.get("dt").contains("Last name").siblings("dd").contains("last");
      cy.get("dt").contains("Alternate name (single field)").siblings("dd").contains("alternate");
      cy.get("dt").contains("Phone number").siblings("dd").contains("123");
      cy.get("dt").contains("Email address").siblings("dd").contains("test@test.com");
      cy.get("dt")
        .contains("Preferred language for communication")
        .siblings("dd")
        .contains("English");
      cy.get("dt").contains("Date of Birth").siblings("dd").contains("2023-01-01");
      cy.get("dt").contains("Date of submission").siblings("dd").contains("2023-01-01");
      cy.get("dt")
        .contains("Department or agency")
        .siblings("dd")
        .contains("Accessibility Standards Canada");

      // Page 2
      cy.get("button").contains("Eligibility Criteria");
      cy.get("dt")
        .contains("Are you applying as an individual or on behalf of an organization?")
        .siblings("dd")
        .contains("-");
      cy.get("dt").contains("Are you applying from within Canada?").siblings("dd").contains("Yes");

      // Page 3
      cy.get("button").contains("Application Details");
      cy.get("dt").contains("Application Type").siblings("dd").contains("Employment");
      cy.get("dt")
        .contains("escribe your request in detail")
        .siblings("dd")
        .contains("request in detail");
      cy.get("dt")
        .contains("Relevant Skills or Experience")
        .siblings("dd")
        .contains("Project Management");
      cy.get("dt")
        .contains("Relevant Skills or Experience")
        .siblings("dd")
        .contains("Research and Analysis");

      // Page 4
      cy.get("button").contains("Additional Information - Funding Support");
      cy.get("dt").contains("Funding Amount Requested").siblings("dd").contains("1");
      cy.get("dt")
        .contains("Have you previously submitted an application?")
        .siblings("dd")
        .contains("Yes");
      cy.get("dt")
        .contains("Select the type of applicaiton:")
        .siblings("dd")
        .contains("application 12345");

      // Page 5
      cy.get("button").contains("Repeating Sets");
      cy.get("h4").contains("List Additional Team Members (if applicable)");
      cy.get("h5").contains("Team Memeber - 1");
      cy.get("dt").contains("Full name").siblings("dd").contains("Full name1");
      cy.get("dt").contains("Time Commitment (Hours per week)").siblings("dd").contains("1");
      cy.get("dt")
        .contains("Primary Responsibilities")
        .siblings("dd")
        .contains("Primary Responsibilities1");
      cy.get("dt").contains("Years of experience").siblings("dd").contains("Less than 1 year");
      cy.get("h5").contains("Team Memeber - 2");
      cy.get("h5")
        .contains("Team Memeber - 2")
        .siblings()
        .contains("Full name")
        .siblings("dd")
        .contains("Full name2");
      cy.get("h5")
        .contains("Team Memeber - 2")
        .siblings()
        .contains("Time Commitment (Hours per week)")
        .siblings("dd")
        .contains("2");
      cy.get("h5")
        .contains("Team Memeber - 2")
        .siblings()
        .contains("Primary Responsibilities")
        .siblings("dd")
        .contains("Primary Responsibilities2");
      cy.get("h5")
        .contains("Team Memeber - 2")
        .siblings()
        .contains("Years of experience")
        .siblings("dd")
        .contains("Less than 1 year");

      cy.get("button[type='submit']").click();
      // clickFormTimer(); -- interesting that enough time passes that the form timer is finished by then end of the form
      cy.get("h1").should("contain", "Your form has been submitted");
    });
  });
});
