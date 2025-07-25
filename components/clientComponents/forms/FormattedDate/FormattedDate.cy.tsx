import React from "react";
import { Formik } from "formik";
import { FormattedDate } from "./FormattedDate";

describe("<FormattedDate />", () => {
  it("mounts", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" />
      </Formik>
    );

    cy.get("[data-testid=formattedDate]").should("exist");
    cy.get("[data-testid=month-number").should("exist");
    cy.get("[data-testid=year-number").should("exist");
    cy.get("[data-testid=day-number").should("exist");

    // Default dateFormat is YYYY-MM-DD
    cy.get("[data-testid=formattedDate]").within(() => {
      cy.get("[data-testid]").eq(0).should("have.attr", "data-testid", "year-number");
      cy.get("[data-testid]").eq(1).should("have.attr", "data-testid", "month-number");
      cy.get("[data-testid]").eq(2).should("have.attr", "data-testid", "day-number");
    });
  });

  it("sets date format to DD-MM-YYYY", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="DD-MM-YYYY" />
      </Formik>
    );

    cy.get("[data-testid=formattedDate]").should("exist");
    cy.get("[data-testid=formattedDate]").within(() => {
      cy.get("[data-testid]").eq(0).should("have.attr", "data-testid", "day-number");
      cy.get("[data-testid]").eq(1).should("have.attr", "data-testid", "month-number");
      cy.get("[data-testid]").eq(2).should("have.attr", "data-testid", "year-number");
    });
  });

  it("sets date format to MM-DD-YYYY", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="MM-DD-YYYY" />
      </Formik>
    );

    cy.get("[data-testid=formattedDate]").should("exist");
    cy.get("[data-testid=formattedDate]").within(() => {
      cy.get("[data-testid]").eq(0).should("have.attr", "data-testid", "month-number");
      cy.get("[data-testid]").eq(1).should("have.attr", "data-testid", "day-number");
      cy.get("[data-testid]").eq(2).should("have.attr", "data-testid", "year-number");
    });
  });

  it("sets date format to YYYY-MM-DD", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="YYYY-MM-DD" />
      </Formik>
    );

    cy.get("[data-testid=formattedDate]").should("exist");
    cy.get("[data-testid=formattedDate]").within(() => {
      cy.get("[data-testid]").eq(0).should("have.attr", "data-testid", "year-number");
      cy.get("[data-testid]").eq(1).should("have.attr", "data-testid", "month-number");
      cy.get("[data-testid]").eq(2).should("have.attr", "data-testid", "day-number");
    });
  });

  it("defaults to YYYY-MM-DD when dateFormat is invalid", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="XXXX-XX-XX" />
      </Formik>
    );

    cy.get("[data-testid=formattedDate]").should("exist");
    cy.get("[data-testid=formattedDate]").within(() => {
      cy.get("[data-testid]").eq(0).should("have.attr", "data-testid", "year-number");
      cy.get("[data-testid]").eq(1).should("have.attr", "data-testid", "month-number");
      cy.get("[data-testid]").eq(2).should("have.attr", "data-testid", "day-number");
    });
  });

  it("renders a legend for the fieldset", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" label="Enter a date" />
      </Formik>
    );

    cy.get("[data-testid=formattedDate] legend").should("exist");
    cy.get("[data-testid=formattedDate] legend").contains("Enter a date");
  });

  it("sets autocomplete bday for the inputs", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" autocomplete="bday" />
      </Formik>
    );

    cy.get("[data-testid=year-number]").should("have.attr", "autocomplete", "bday-year");
    cy.get("[data-testid=month-number]").should("have.attr", "autocomplete", "bday-month");
    cy.get("[data-testid=day-number]").should("have.attr", "autocomplete", "bday-day");
  });

  it("adds aria-describedby description", () => {
    cy.viewport(800, 400);

    cy.mount(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate
          name="formattedDate"
          label="Enter a date"
          description="This is a description"
        />
      </Formik>
    );

    cy.get("[data-testid=formattedDate]").should("have.attr", "aria-roledescription");
    cy.get("[data-testid=formattedDate]").should("have.attr", "aria-labelledby");
    cy.get("[data-testid=description]").should("exist");
    cy.get("[data-testid=description]").contains("This is a description");
  });
});
