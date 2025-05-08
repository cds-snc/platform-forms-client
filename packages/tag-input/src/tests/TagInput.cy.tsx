"use client";
import React from "react";

import { TagInput } from "../TagInput";

describe("<TagInput />", () => {
  it("renders without crashing", () => {
    cy.mount(
      <div>
        <TagInput initialTags={[]} />
      </div>
    );
  });

  it("accepts initial tags", () => {
    cy.mount(
      <div>
        <TagInput
          initialTags={["Tag one", "Tag two", "Tag three"]}
          onTagAdd={() => {}}
          onTagRemove={() => {}}
        />
      </div>
    );

    cy.get(".gc-tag").should("have.length", 3);
    cy.get(".gc-tag").should("contain", "Tag one");
    cy.get(".gc-tag").should("contain", "Tag two");
    cy.get(".gc-tag").should("contain", "Tag three");
  });

  it("sets the name attribute", () => {
    cy.mount(
      <div>
        <TagInput initialTags={[]} name="test-name" />
      </div>
    );

    cy.get("[data-testid='tag-input']").should("have.attr", "name", "test-name");
  });

  it("adds a custom label", () => {
    cy.mount(
      <div>
        <TagInput initialTags={[]} label="Custom Label" />
      </div>
    );

    cy.get(".gc-tag-input-label").should("contain", "Custom Label");
  });

  it("adds a custom description", () => {
    cy.mount(
      <div>
        <TagInput initialTags={[]} description="Custom Description" />
      </div>
    );

    cy.get(".gc-tag-input-description").should("contain", "Custom Description");
  });

  it("adds a tag", () => {
    cy.mount(
      <div>
        <TagInput initialTags={[]} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("New Tag{enter}");
    cy.get("[data-testid='tag-input']").should("have.value", "");
    cy.get(".gc-tag").should("contain", "New Tag");
  });

  it("applies an aria-label to a tag", () => {
    cy.mount(
      <div>
        <TagInput initialTags={["Tag 1"]} />
      </div>
    );

    cy.get(".gc-tag").should("have.attr", "aria-label", `Tag "Tag 1"`);
  });

  it("announces that a tag was added", () => {
    cy.mount(
      <div>
        <TagInput initialTags={[]} />
      </div>
    );
    cy.get("[data-testid='tag-input']").type("New Tag{enter}");
    cy.get("#tag-input-live-region").should("exist").and("contain", `Tag "New Tag" added`);
  });

  it("restricts duplicates", () => {
    cy.mount(
      <div>
        <TagInput initialTags={["Tag 1"]} restrictDuplicates={true} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("Tag 1{enter}");
    cy.get("[data-testid='tag-input']").should("have.value", "");
    cy.get(".gc-tag").should("have.length", 1);
  });

  it("announces that a duplicate tag was added", () => {
    cy.mount(
      <div>
        <TagInput initialTags={["Tag 1"]} restrictDuplicates={true} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("Tag 1{enter}");
    cy.get("#tag-input-live-region").should("exist").and("contain", `Duplicate tag "Tag 1"`);
  });

  it("allows duplicates", () => {
    cy.mount(
      <div>
        <TagInput initialTags={["Tag 1"]} restrictDuplicates={false} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("Tag 1{enter}");
    cy.get("[data-testid='tag-input']").should("have.value", "");
    cy.get(".gc-tag").should("have.length", 2);
  });

  it("removes a tag", () => {
    const onTagRemove = cy.stub().as("onTagRemove");

    cy.mount(
      <div>
        <TagInput initialTags={["Tag 1", "Tag 2"]} onTagAdd={() => {}} onTagRemove={onTagRemove} />
      </div>
    );

    cy.get(".gc-tag").should("contain", "Tag 2").should("contain", "Tag 1");
    cy.get("#tag-0 button").click();
    cy.get(".gc-tag").should("contain", "Tag 2").should("not.contain", "Tag 1");
    cy.get("@onTagRemove").should("have.been.calledWith", "Tag 1");
  });

  it("removes a selected tag", () => {
    cy.mount(
      <div>
        <TagInput initialTags={["one", "two", "three", "four", "five", "six"]} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("{leftarrow}{leftarrow}{leftarrow}{leftarrow}{del}");
    cy.get("#tag-input-live-region").should("exist").and("contain", `Tag "three" removed`);
    cy.get(".gc-tag").should("not.contain", "three");
  });

  it("announces when a tag is removed", () => {
    cy.mount(
      <div>
        <TagInput initialTags={["Tag 1"]} onTagAdd={() => {}} onTagRemove={() => {}} />
      </div>
    );

    cy.get(".gc-tag").should("contain", "Tag 1");
    cy.get(".gc-tag button").click();
    cy.get("#tag-input-live-region").should("exist").and("contain", `Tag "Tag 1" removed`);
  });

  it("calls onTagAdd handler when adding a tag", () => {
    const onTagAdd = cy.stub().as("onTagAdd");

    cy.mount(
      <div>
        <TagInput initialTags={[]} onTagAdd={onTagAdd} onTagRemove={() => {}} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("New Tag{enter}");
    cy.get("[data-testid='tag-input']").should("have.value", "");
    cy.get(".gc-tag").should("contain", "New Tag");
    cy.get("@onTagAdd").should("have.been.calledWith", "New Tag");
  });

  it("calls onTagRemove handler when removing a tag", () => {
    const onTagRemove = cy.stub().as("onTagRemove");

    cy.mount(
      <div>
        <TagInput initialTags={["Tag one", "Tag two"]} onTagRemove={onTagRemove} />
      </div>
    );

    cy.get(".gc-tag").should("contain", "Tag one");
    cy.get(".gc-tag").first().find("button").click();
    cy.get("[data-testid='tag-input']").should("not.contain", "Tag one");
    cy.get("@onTagRemove").should("have.been.calledWith", "Tag one");
  });

  it("validates the tag according to the validation function", () => {
    const validateTag = (tag: string) => {
      const errors: string[] = [];

      if (tag.length < 3) {
        errors.push("Tag must be at least 3 characters long");
      }

      if (/\d/.test(tag)) {
        errors.push("Tag must not include numbers");
      }

      if (tag.length > 10) {
        errors.push("Tag must be at most 10 characters long");
      }

      return {
        isValid: errors.length === 0,
        errors: errors,
      };
    };

    cy.mount(
      <div>
        <TagInput validateTag={validateTag} />
      </div>
    );

    cy.get("[data-testid='tag-input']").type("ab{enter}");
    cy.get("[data-testid='tag-input-error'] div").should("have.length", 1);
    cy.get("[data-testid='tag-input-error']").should(
      "contain",
      "Tag must be at least 3 characters long"
    );

    cy.get("[data-testid='tag-input']").type("abcdefghijklmnopqrstuvwxy{enter}");
    cy.get("[data-testid='tag-input-error'] div").should("have.length", 1);
    cy.get("[data-testid='tag-input-error']").should(
      "contain",
      "Tag must be at most 10 characters long"
    );

    // Multiple errors
    cy.get("[data-testid='tag-input']").type("T1{enter}");
    cy.get("[data-testid='tag-input-error'] div").should("have.length", 2);
    cy.get("[data-testid='tag-input-error']").should(
      "contain",
      "Tag must be at least 3 characters long"
    );
    cy.get("[data-testid='tag-input-error']").should("contain", "Tag must not include numbers");
  });
});
