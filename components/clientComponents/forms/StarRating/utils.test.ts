import {
  getFormattedStarRatingFromObject,
  getScoreFromStarRatingObject,
  isValidStarRatingObject,
} from "./utils";
import type { StarRatingObject } from "./types";

describe("isValidStarRatingObject", () => {
  it("returns true for a valid star rating object", () => {
    const validObject: StarRatingObject = { value: 4, numberOfStars: 5 };

    expect(isValidStarRatingObject(validObject)).toBe(true);
  });

  it("returns false for non-object inputs", () => {
    expect(isValidStarRatingObject(null)).toBe(false);
    expect(isValidStarRatingObject(undefined)).toBe(false);
    expect(isValidStarRatingObject("4/5")).toBe(false);
    expect(isValidStarRatingObject(42)).toBe(false);
  });

  it("returns false for objects with missing properties", () => {
    expect(isValidStarRatingObject({})).toBe(false);
    expect(isValidStarRatingObject({ value: 4 })).toBe(false);
    expect(isValidStarRatingObject({ numberOfStars: 5 })).toBe(false);
  });

  it("returns false for objects with invalid property types", () => {
    expect(isValidStarRatingObject({ value: "4", numberOfStars: 5 })).toBe(false);
    expect(isValidStarRatingObject({ value: 4, numberOfStars: "5" })).toBe(false);
  });
});

describe("getFormattedStarRatingFromObject", () => {
  it("formats a valid object in English by default", () => {
    expect(getFormattedStarRatingFromObject({ value: 4, numberOfStars: 5 })).toBe("4 out of 5");
  });

  it("formats a valid object in French", () => {
    expect(getFormattedStarRatingFromObject({ value: 3, numberOfStars: 5 }, "fr")).toBe("3 sur 5");
  });

  it("formats a valid JSON string", () => {
    expect(getFormattedStarRatingFromObject('{"value":2,"numberOfStars":5}')).toBe("2 out of 5");
  });

  it('returns "-" for invalid JSON strings', () => {
    expect(getFormattedStarRatingFromObject("not-json")).toBe("-");
  });

  it('returns "-" for parsed objects that are not valid star ratings', () => {
    expect(getFormattedStarRatingFromObject('{"value":"2","numberOfStars":5}')).toBe("-");
    expect(getFormattedStarRatingFromObject('{"foo":"bar"}')).toBe("-");
  });
});

describe("getScoreFromStarRatingObject", () => {
  it("returns score from a valid object", () => {
    expect(getScoreFromStarRatingObject({ value: 5, numberOfStars: 5 })).toBe(5);
  });

  it("returns score from a valid JSON string", () => {
    expect(getScoreFromStarRatingObject('{"value":1,"numberOfStars":5}')).toBe(1);
  });

  it("returns undefined for invalid JSON strings", () => {
    expect(getScoreFromStarRatingObject("not-json")).toBeUndefined();
  });

  it("returns undefined for invalid star rating objects", () => {
    expect(getScoreFromStarRatingObject('{"value":"1","numberOfStars":5}')).toBeUndefined();
    expect(getScoreFromStarRatingObject('{"foo":"bar"}')).toBeUndefined();
  });
});
