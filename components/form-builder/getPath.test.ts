import { parseRootId, getElementIndexes, indexesToPath, getPath, getPathString } from "./getPath";

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
    expect(getElementIndexes(1210, elements)).toEqual([3, null]);
  });

  it("parses 3 digit elIndex and subIndex", () => {
    const elements = [
      { id: 1 },
      { id: 2, properties: { subElements: [{ id: 201 }, { id: 202 }, { id: 203 }] } },
      { id: 3 },
      { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
    ];
    const [elIndex, subIndex] = getElementIndexes(201, elements);
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
    const [elIndex, subIndex] = getElementIndexes(1210, elements);
    expect(elIndex).toEqual(3);
    expect(subIndex).toEqual(2);
    expect;
  });
});

describe("Get paths by indexes", () => {
  const elements = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
  ];
  const [elPath, subPath] = indexesToPath([3, 2], elements);
  expect(elPath).toEqual(elements[3]);
  expect(subPath).toEqual(elements[3].properties?.subElements?.[2]);
});

describe("Get paths by id", () => {
  const elements = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
  ];
  const [elPath, subPath] = getPath(1202, elements);
  expect(elPath).toEqual(elements[3]);
  expect(subPath).toEqual(elements[3].properties?.subElements?.[1]);
});

describe("Get path string by id", () => {
  it("gets element path", async () => {
    const elements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
    ];
    const path = getPathString(2, elements);
    expect(path).toEqual("form.elements[1].properties");
  });

  it("gets subPath", async () => {
    const elements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 12, properties: { subElements: [{ id: 1201 }, { id: 1202 }, { id: 1210 }] } },
    ];
    const path = getPathString(1202, elements);
    expect(path).toEqual("form.elements[3].properties?.subElements?.[1]");
  });
});
