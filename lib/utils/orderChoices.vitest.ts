import { describe, it, expect } from "vitest";
import { orderChoices } from "./orderChoices";

describe("orderChoices", () => {
  it("should return sorted choices in ascending order", () => {
    const id = "testId";
    const choices = ["banana", "apple", "cherry"];
    const sortOrder = "ascending";
    const result = orderChoices(id, choices, sortOrder);
    expect(result).toEqual([
      { choice: "apple", index: 1, innerId: `${id}.1` },
      { choice: "banana", index: 0, innerId: `${id}.0` },
      { choice: "cherry", index: 2, innerId: `${id}.2` },
    ]);
  });

  it("should return sorted choices in descending order", () => {
    const id = "testId";
    const choices = ["banana", "apple", "cherry"];
    const sortOrder = "descending";
    const result = orderChoices(id, choices, sortOrder);
    expect(result).toEqual([
      { choice: "cherry", index: 2, innerId: `${id}.2` },
      { choice: "banana", index: 0, innerId: `${id}.0` },
      { choice: "apple", index: 1, innerId: `${id}.1` },
    ]);
  });

  it("should return unsorted choices when no sortOrder is provided", () => {
    const id = "testId";
    const choices = ["banana", "apple", "cherry"];
    const result = orderChoices(id, choices);
    expect(result).toEqual([
      { choice: "banana", index: 0, innerId: `${id}.0` },
      { choice: "apple", index: 1, innerId: `${id}.1` },
      { choice: "cherry", index: 2, innerId: `${id}.2` },
    ]);
  });
});
