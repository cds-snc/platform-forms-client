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
  const elements = [
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
    {
      id: 12,
    },
  ];

  it("parses root id", () => {
    expect(getPath(elements, 1210)).toEqual(3);
  });
});
