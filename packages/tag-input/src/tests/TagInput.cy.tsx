"use client";
import React from "react";

import { TagInput } from "../TagInput";

describe("<TagInput />", () => {
  it("renders without crashing", () => {
    cy.mount(
      <div>
        <TagInput tags={[]} />
      </div>
    );
  });

  it("accepts initial tags", () => {
    cy.mount(
      <div>
        <TagInput
          tags={["Tag one", "Tag two", "Tag three"]}
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
        <TagInput tags={[]} name="test-name" />
      </div>
    );

    cy.get('input[type="text"]').should("have.attr", "name", "test-name");
  });

  it("adds a custom label", () => {
    cy.mount(
      <div>
        <TagInput tags={[]} label="Custom Label" />
      </div>
    );

    cy.get(".gc-tag-input-label").should("contain", "Custom Label");
  });

  it("adds a custom description", () => {
    cy.mount(
      <div>
        <TagInput tags={[]} description="Custom Description" />
      </div>
    );

    cy.get(".gc-tag-input-description").should("contain", "Custom Description");
  });

  it("adds a tag", () => {
    cy.mount(
      <div>
        <TagInput tags={[]} />
      </div>
    );

    cy.get('input[type="text"]').type("New Tag{enter}");
    cy.get('input[type="text"]').should("have.value", "");
    cy.get(".gc-tag").should("contain", "New Tag");
  });

  it("announces that a tag was added", () => {
    cy.mount(
      <div>
        <TagInput tags={[]} />
      </div>
    );
    cy.get('input[type="text"]').type("New Tag{enter}");
    cy.get('[id^="tag-input-live-region-"]').should("exist").and("contain", `Tag "New Tag" added`);
  });

  it("restricts duplicates", () => {
    cy.mount(
      <div>
        <TagInput tags={["Tag 1"]} restrictDuplicates={true} />
      </div>
    );

    cy.get('input[type="text"]').type("Tag 1{enter}");
    cy.get('input[type="text"]').should("have.value", "");
    cy.get(".gc-tag").should("have.length", 1);
  });

  it("announces that a duplicate tag was added", () => {
    cy.mount(
      <div>
        <TagInput tags={["Tag 1"]} restrictDuplicates={true} />
      </div>
    );

    cy.get('input[type="text"]').type("Tag 1{enter}");
    cy.get('[id^="tag-input-live-region-"]')
      .should("exist")
      .and("contain", `Duplicate tag "Tag 1"`);
  });

  it("allows duplicates", () => {
    cy.mount(
      <div>
        <TagInput tags={["Tag 1"]} restrictDuplicates={false} />
      </div>
    );

    cy.get('input[type="text"]').type("Tag 1{enter}");
    cy.get('input[type="text"]').should("have.value", "");
    cy.get(".gc-tag").should("have.length", 2);
  });

  it("removes a tag", () => {
    const onTagRemove = cy.stub().as("onTagRemove");

    cy.mount(
      <div>
        <TagInput tags={["Tag 1"]} onTagAdd={() => {}} onTagRemove={onTagRemove} />
      </div>
    );

    cy.get(".gc-tag").should("contain", "Tag 1");
    cy.get(".gc-tag button").click();
    cy.get(".gc-tag").should("not.exist");
    cy.get(".gc-tag-input").should("not.contain", "Tag 1");
    cy.get("@onTagRemove").should("have.been.calledWith", "Tag 1");
  });

  it("announces when a tag is removed", () => {
    cy.mount(
      <div>
        <TagInput tags={["Tag 1"]} onTagAdd={() => {}} onTagRemove={() => {}} />
      </div>
    );

    cy.get(".gc-tag").should("contain", "Tag 1");
    cy.get(".gc-tag button").click();
    cy.get('[id^="tag-input-live-region-"]').should("exist").and("contain", `Tag "Tag 1" removed`);
  });

  it("calls onTagAdd handler when adding a tag", () => {
    const onTagAdd = cy.stub().as("onTagAdd");

    cy.mount(
      <div>
        <TagInput tags={[]} onTagAdd={onTagAdd} onTagRemove={() => {}} />
      </div>
    );

    cy.get('input[type="text"]').type("New Tag{enter}");
    cy.get('input[type="text"]').should("have.value", "");
    cy.get(".gc-tag").should("contain", "New Tag");
    cy.get("@onTagAdd").should("have.been.calledWith", "New Tag");
  });

  it("calls onTagRemove handler when removing a tag", () => {
    const onTagRemove = cy.stub().as("onTagRemove");

    cy.mount(
      <div>
        <TagInput tags={["Tag one", "Tag two"]} onTagRemove={onTagRemove} />
      </div>
    );

    cy.get(".gc-tag").should("contain", "Tag one");
    cy.get(".gc-tag").first().find("button").click();
    cy.get(".gc-tag-input").should("not.contain", "Tag one");
    cy.get("@onTagRemove").should("have.been.calledWith", "Tag one");
  });
});
