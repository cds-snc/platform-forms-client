import React from "react";
import { PanelActions } from "../PanelActions";
import { FormElementTypes } from "@lib/types";

describe("<PanelActions />", () => {
  it("enables move buttons for item that is not first or last", () => {
    const item = {
      id: 1,
      index: 1,
      questionNumber: 1,
      type: FormElementTypes.textField,
      properties: {
        titleEn: "Title",
        titleFr: "Titre",
      },
    };

    cy.viewport(800, 80);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <PanelActions
        item={item}
        renderMoreButton={undefined}
        handleAdd={function (index: number, type?: FormElementTypes | undefined): void {
          throw new Error(`Function not implemented. ${index} ${type}`);
        }}
        handleRemove={function (): void {
          throw new Error("Function not implemented.");
        }}
        handleMoveUp={function (): void {
          throw new Error("Function not implemented.");
        }}
        handleMoveDown={function (): void {
          throw new Error("Function not implemented.");
        }}
        handleDuplicate={function (): void {
          throw new Error("Function not implemented.");
        }}
        elementsLength={3}
      />
    );

    cy.get('[data-testid="moveUp"]').should("not.be.disabled");
    cy.get('[data-testid="moveDown"]').should("not.be.disabled");
  });

  it("disables move buttons for first and last item", () => {
    const item = {
      id: 1,
      index: 0,
      questionNumber: 1,
      type: FormElementTypes.textField,
      properties: {
        titleEn: "Title",
        titleFr: "Titre",
      },
    };

    cy.viewport(800, 80);
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <PanelActions
        item={item}
        renderMoreButton={undefined}
        handleAdd={function (index: number, type?: FormElementTypes | undefined): void {
          throw new Error(`Function not implemented. ${index} ${type}`);
        }}
        handleRemove={function (): void {
          throw new Error("Function not implemented.");
        }}
        handleMoveUp={function (): void {
          throw new Error("Function not implemented.");
        }}
        handleMoveDown={function (): void {
          throw new Error("Function not implemented.");
        }}
        handleDuplicate={function (): void {
          throw new Error("Function not implemented.");
        }}
        elementsLength={1}
      />
    );

    cy.get('[data-testid="moveUp"]').should("be.disabled");
    cy.get('[data-testid="moveUp"]').should("have.attr", "tabindex", "-1");
    cy.get('[data-testid="moveDown"]').should("be.disabled");
    cy.get('[data-testid="moveDown"]').should("have.attr", "tabindex", "-1");
    cy.get('[data-testid="duplicate"]').should("not.be.disabled");
    cy.get('[data-testid="duplicate"]').should("have.attr", "tabindex", "0");
    cy.get('[data-testid="remove"]').should("not.be.disabled");
    cy.get('[data-testid="remove"]').should("have.attr", "tabindex", "-1");
    cy.get('[data-testid="more"]').should("not.be.disabled");
    cy.get('[data-testid="more"]').should("have.attr", "tabindex", "-1");

    // Keyboard navigation should start at duplicate
    cy.get("body").tab();
    cy.focused().should("have.attr", "data-testid", "duplicate");
    cy.get("body").type("{leftArrow}");
    cy.focused().should("have.attr", "data-testid", "duplicate");
    cy.get("body").type("{rightArrow}");
    cy.focused().should("have.attr", "data-testid", "remove");
  });

  it("can keyboard navigate", () => {
    const item = {
      id: 1,
      index: 1,
      questionNumber: 1,
      type: FormElementTypes.textField,
      properties: {
        titleEn: "Title",
        titleFr: "Titre",
      },
    };

    cy.viewport(800, 80);
    cy.mount(
      <div className="group active">
        <PanelActions
          item={item}
          renderMoreButton={undefined}
          handleAdd={function (index: number, type?: FormElementTypes | undefined): void {
            throw new Error(`Function not implemented. ${index} ${type}`);
          }}
          handleRemove={function (): void {
            throw new Error("Function not implemented.");
          }}
          handleMoveUp={function (): void {
            throw new Error("Function not implemented.");
          }}
          handleMoveDown={function (): void {
            throw new Error("Function not implemented.");
          }}
          handleDuplicate={function (): void {
            throw new Error("Function not implemented.");
          }}
          elementsLength={3}
        />
      </div>
    );
    cy.get("body").tab();
    cy.focused().should("have.attr", "data-testid", "moveUp");
    cy.get("body").type("{rightArrow}");
    cy.focused().should("have.attr", "data-testid", "moveDown");
    cy.get("body").type("{rightArrow}");
    cy.focused().should("have.attr", "data-testid", "duplicate");
    cy.get("body").type("{rightArrow}");
    cy.focused().should("have.attr", "data-testid", "remove");
    cy.get("body").type("{rightArrow}");
    cy.focused().should("have.attr", "data-testid", "more");
    cy.get("body").type("{rightArrow}");
    cy.focused().should("have.attr", "data-testid", "more");
    cy.get("body").type("{leftArrow}");
    cy.focused().should("have.attr", "data-testid", "remove");
    cy.get("body").type("{leftArrow}");
    cy.focused().should("have.attr", "data-testid", "duplicate");
    cy.get("body").type("{leftArrow}");
    cy.focused().should("have.attr", "data-testid", "moveDown");
    cy.get("body").type("{leftArrow}");
    cy.focused().should("have.attr", "data-testid", "moveUp");
    cy.tab();
    cy.focused().should("have.attr", "data-testid", "add-element");
    cy.tab({ shift: true });
    cy.focused().should("have.attr", "data-testid", "moveUp");
  });
});
