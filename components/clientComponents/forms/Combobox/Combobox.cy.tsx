import React from "react";
import { Combobox } from "./Combobox";
import { Formik } from "formik";

describe("<Combobox />", () => {
  it("mounts", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    cy.get("[data-testid=combobox]").should("exist");
    cy.get("[data-testid=combobox-input]").should("exist");
    cy.get("[data-testid=combobox-listbox]").should("exist");
    cy.get("[data-testid=combobox-listbox]").should("not.be.visible");
  });

  it("filters list based on input", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    cy.get("[data-testid=combobox-input]").click();
    cy.get("[data-testid=combobox-listbox]").should("be.visible");
    cy.get("[data-testid=combobox-input]").type("o");
    cy.get("[data-testid=combobox-listbox] > li").should("have.length", 3);
    cy.get("[data-testid=combobox-input]").type("n");
    cy.get("[data-testid=combobox-listbox] > li").should("have.length", 1);
  });

  it("keyboard navigates the list", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    cy.get("[data-testid=combobox-input]").type("{downarrow}");
    cy.get("[data-testid=combobox-listbox] > li")
      .contains("one")
      .should("have.attr", "aria-selected", "true");

    cy.get("[data-testid=combobox-input]").type("{downarrow}");
    cy.get("[data-testid=combobox-listbox] > li")
      .contains("two")
      .should("have.attr", "aria-selected", "true");

    cy.get("[data-testid=combobox-input]").type("{downarrow}");
    cy.get("[data-testid=combobox-listbox] > li")
      .contains("three")
      .should("have.attr", "aria-selected", "true");

    cy.get("[data-testid=combobox-input]").type("{downarrow}");
    cy.get("[data-testid=combobox-listbox] > li")
      .contains("four")
      .should("have.attr", "aria-selected", "true");

    cy.get("[data-testid=combobox-input]").type("{downarrow}");
    cy.get("[data-testid=combobox-listbox] > li")
      .contains("five")
      .should("have.attr", "aria-selected", "true");
  });

  it("sets visibility of list based on focus", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    cy.get("[data-testid=combobox-listbox]").should("not.be.visible");
    cy.get("[data-testid=combobox-input]").click();
    cy.get("[data-testid=combobox-listbox]").should("be.visible");
    cy.get("[data-testid=combobox-input]").should("have.attr", "aria-expanded", "true");
    cy.get("[data-testid=combobox-input]").blur();
    cy.get("[data-testid=combobox-listbox]").should("not.be.visible");
  });

  it("selects items from the list", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    cy.get("[data-testid=combobox-input]").type("{downarrow}{downarrow}{enter}");
    cy.get("[data-testid=combobox-input]").should("have.value", "two");
    cy.get("[data-testid=combobox-listbox]").should("not.be.visible");

    cy.get("[data-testid=combobox-input]").type("{backspace}{backspace}{backspace}");
    cy.get("[data-testid=combobox-input]").should("have.value", "");
    cy.get("[data-testid=combobox-input]").type(
      "{downarrow}{downarrow}{downarrow}{downarrow}{enter}"
    );
    cy.get("[data-testid=combobox-input]").should("have.value", "four");
    cy.get("[data-testid=combobox-input]").type("{esc}");
    cy.get("[data-testid=combobox-input]").should("have.value", "");
  });

  it("clears input by pressing escape", () => {
    cy.viewport(800, 400);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    cy.get("[data-testid=combobox-input]").type("two{enter}");
    cy.get("[data-testid=combobox-input]").should("have.value", "two");

    cy.get("[data-testid=combobox-input]").type("{esc}");
    cy.get("[data-testid=combobox-input]").should("have.value", "");
  });
});
