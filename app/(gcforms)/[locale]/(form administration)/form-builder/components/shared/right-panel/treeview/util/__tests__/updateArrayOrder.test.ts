import {updateArrayOrder} from "../updateArrayOrder";

describe("updateArrayOrder", () => {
  it("Swaps array order", () => {
    expect(updateArrayOrder([{a: "A"}, {b : "B"}, {c: "C"}], 0, 2)).toEqual([{c: "C"}, {b : "B"}, {a: "A"}]);
    expect(updateArrayOrder([{a: "A"}, {b : "B"}, {c: "C"}], 0, 1)).toEqual([{b: "B"}, {a : "A"}, {c: "C"}]);
  });
});
