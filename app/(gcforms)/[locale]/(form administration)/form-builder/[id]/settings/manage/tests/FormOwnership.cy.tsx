import React from "react";
import { FormOwnership } from "../FormOwnership";
const allUsers = [
  { id: "1", name: "John Doe", email: "john.doe@test.com" },
  { id: "2", name: "Jane Doe", email: "jane.doe@test.com" },
  { id: "3", name: "John Smith", email: "john.smith@test.com" },
  { id: "4", name: "Jane Smith", email: "jane.smith@test.com" },
];

const usersAssignedToFormRecord = [{ id: "1", name: "John Doe", email: "john.doe@test.com" }];

describe("<FormOwnership />", () => {
  it("can mount the component", () => {
    cy.mount(<FormOwnership formRecord={{}} usersAssignedToFormRecord={[]} allUsers={[]} />);
    cy.contains("Manage ownership");
  });

  it("can render the component with users assigned", () => {
    cy.mount(
      <FormOwnership
        formRecord={{}}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
      />
    );
    cy.contains("Manage ownership");
    cy.contains("john.doe@test.com");
  });
});
