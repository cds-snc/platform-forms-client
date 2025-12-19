import { reorderElements } from "../updateArrayOrder";

describe("updateArrayOrder", () => {
  it("reorders elements by id", () => {

    const result = reorderElements(["101", "104", "106"], [{
      id: 106,
      name: "name3"
    }, {
      id: 104,
      name: "name2"
    }, {
      id: 101,
      name: "name1"
    }]);

    expect(result).toEqual([{
      id: 101,
      name: "name1"
    }, {
      id: 104,
      name: "name2"
    }, {
      id: 106,
      name: "name3"
    }]);
  });
});
