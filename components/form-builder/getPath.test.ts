import { getPath, parseId } from "./getPath";

describe("Parse element ID", () => {
  it("parses root id", () => {
    expect(parseId(1)).toEqual(1);
    expect(parseId(12)).toEqual(12);
  });

  it("parses sub id", () => {
    expect(parseId(1201)).toEqual(12);
    expect(parseId(1202)).toEqual(12);
    expect(parseId(1210)).toEqual(12);
  });
});

describe("Get path by ID", () => {
  it("parses elIndex", () => {
    const elements = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 12 }];
    expect(getPath(elements, 1210)).toEqual([3, null]);
  });

  it("parses elIndex and subIndex", () => {
    const elements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
    ];
    const [elIndex, subIndex] = getPath(elements, 1210);
    expect(elIndex).toEqual(3);
    expect(subIndex).toEqual(2);
    expect;
  });
});
