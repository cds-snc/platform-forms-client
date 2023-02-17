import { getElementIndexes, parseRootId } from "./getPath";

describe("Parse root ID", () => {
  it("parses root id", () => {
    expect(parseRootId(1)).toEqual(1);
    expect(parseRootId(9)).toEqual(9);
    expect(parseRootId(12)).toEqual(12);
    expect(parseRootId(101)).toEqual(1);
    expect(parseRootId(201)).toEqual(2);
    expect(parseRootId(1201)).toEqual(12);
    expect(parseRootId(1202)).toEqual(12);
    expect(parseRootId(1210)).toEqual(12);
  });
});

describe("Get array indexes for path by element ID", () => {
  it("parses elIndex", () => {
    const elements = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 12 }];
    expect(getElementIndexes(elements, 1210)).toEqual([3, null]);
  });

  it("parses 3 digit elIndex and subIndex", () => {
    const elements = [
      { id: 1 },
      { id: 2, properties: { subElements: [{ id: 201 }, { id: 202 }, { id: 203 }] } },
      { id: 3 },
      { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
    ];
    const [elIndex, subIndex] = getElementIndexes(elements, 201);
    expect(elIndex).toEqual(1);
    expect(subIndex).toEqual(0);
  });

  it("parses 4 digit elIndex and subIndex", () => {
    const elements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
    ];
    const [elIndex, subIndex] = getElementIndexes(elements, 1210);
    expect(elIndex).toEqual(3);
    expect(subIndex).toEqual(2);
    expect;
  });
});
