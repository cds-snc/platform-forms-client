import { FORM_ID_MULTI_PAGE } from "../includes";
import { submitFormSuccess, ignoreExceptions } from "../utils";

describe("Multi-Page Form", () => {
  ignoreExceptions();

  beforeEach(() => {
    cy.visitPage(`/en/id/${FORM_ID_MULTI_PAGE}`);
  });

  it("Page loads", () => {
    cy.get("h1").should("contain", "test-kitchen-sink-multi-page");
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

    submitFormSuccess();
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

    // Are you applying as an.. intentionally left blank for testing an empty response

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

    // interesting that enough time passes that the form timer is finished by then end of the multi-page form
    submitFormSuccess(false);
  });
});
