import React from "react";
import { RichTextEditor } from "../RichTextEditor";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";

describe("<RichTextEditor />", () => {
  it("Adds and styles text", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Providers form={store}>
        <div className="form-builder">
          <RichTextEditor path="path.to.content" content="" ariaLabel="AriaLabel" lang="en" />
        </div>
      </Providers>
    );

    // Add some strings to get formatted
    cy.get(`[id^="editor-"]`).type("H2 heading text{enter}");
    cy.get(`[id^="editor-"]`).type("H3 heading text{enter}");
    cy.get(`[id^="editor-"]`).type("Let's bold part of this sentence.{enter}");
    cy.get(`[id^="editor-"]`).type("Let's italicize part of this sentence.{enter}");
    cy.get(`[id^="editor-"]`).type("Part of his one will be a link{enter}");

    // Add a link
    cy.get(`[id^="editor-"]`).setSelection("will be a link");
    cy.get('[data-testid="link-button"]').first().click();
    cy.get('[data-testid="link-editor"]').first().click();
    cy.get('[data-testid="link-editor"]').type("example.com{enter}{esc}");
    cy.get('[id^="editor-"] a').first().contains("will be a link");

    // Add H2 heading
    cy.get(`[id^="editor-"]`).setSelection("H2 heading text");
    cy.get('[data-testid="h2-button"]').first().click();
    cy.get('[id^="editor-"] h2').first().contains("H2 heading text");
    cy.get('[data-testid="h2-button"]').first().should("have.attr", "aria-pressed", "true");

    // Add H3 heading
    cy.get(`[id^="editor-"]`).setSelection("H3 heading text");
    cy.get('[data-testid="h3-button"]').first().click();
    cy.get('[id^="editor-"] h3').first().contains("H3 heading text");
    cy.get('[data-testid="h3-button"]').first().should("have.attr", "aria-pressed", "true");

    // Bold part of the text
    cy.get(`[id^="editor-"]`).setSelection("bold part of this");
    cy.get('[data-testid="bold-button"]').first().click();
    cy.get('[id^="editor-"] strong').first().contains("bold part of this");
    cy.get('[data-testid="bold-button"]').first().should("have.attr", "aria-pressed", "true");

    // Italicize part of the text
    cy.get(`[id^="editor-"]`).setSelection("italicize part of this");
    cy.get('[data-testid="italic-button"]').first().click();
    cy.get('[id^="editor-"] em').first().contains("italicize part of this");
    cy.get('[data-testid="italic-button"]').first().should("have.attr", "aria-pressed", "true");

    // Add a bullet list
    cy.get(`[id^="editor-"]`).type("{moveToEnd}This is a bullet list item");
    cy.get('[data-testid="bullet-list-button"]').first().click();

    cy.get(`[id^="editor-"]`)
      .setCursorAfter("This is a bullet list item")
      .type("{enter}This is another bullet list item");
    cy.get('[data-testid="bullet-list-button"]')
      .first()
      .should("have.attr", "aria-pressed", "true");
    cy.get('[id^="editor-"] ul li').first().contains("This is a bullet list item");
    cy.get('[id^="editor-"] ul li').last().contains("This is another bullet list item");

    // Add a numbered list - two {enter}s are needed to escape the previous list
    cy.get(`[id^="editor-"]`).type("{moveToEnd}{enter}{enter}This is a numbered list item");
    cy.get('[data-testid="numbered-list-button"]').first().click();
    cy.get('[data-testid="numbered-list-button"]')
      .first()
      .should("have.attr", "aria-pressed", "true");
    cy.get(`[id^="editor-"]`)
      .setCursorAfter("This is a numbered list item")
      .type("{enter}This is another numbered list item");
    cy.get('[data-testid="numbered-list-button"]')
      .first()
      .should("have.attr", "aria-pressed", "true");
    cy.get('[id^="editor-"] ol li').first().contains("This is a numbered list item");
    cy.get('[id^="editor-"] ol li').last().contains("This is another numbered list item");
  });
});
