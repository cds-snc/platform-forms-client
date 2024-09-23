import { updateArrayOrder } from "../updateArrayOrder";

describe("updateArrayOrder", () => {
  it("Swaps array order", () => {

    // Move "A" to the first position
    const result1 = updateArrayOrder([{ d: "D" }, { a: "A" }, { c: "C" }, { b: "B" }], 0, 1);
    expect(result1).toEqual([{ a: "A" }, { d: "D" }, { c: "C" }, { b: "B" }]);

    // Move "C" to the second position
    const result2 = updateArrayOrder(result1, 1, 3);
    expect(result2).toEqual([{ a: "A" }, { c: "C" }, { b: "B" }, { d: "D" }]);

    // Move "B" to the second position
    const result3 = updateArrayOrder(result2, 2, 1);
    expect(result3).toEqual([{ a: "A" }, { b: "B" }, { c: "C" }, { d: "D" }]);
  });
});
