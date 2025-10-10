import { describe, it, expect } from "vitest";
import { mapAnswers } from "./mapAnswers";
import kitchen from "./__fixtures__/kitchen-sink-form-application-2025-10-10.json";
import answersFixture from "./__fixtures__/answers.json";
import type { PublicFormRecord } from "@gcforms/types";

describe("mapAnswers", () => {
  it("maps kitchen-sink fixture answers into mapped answer objects", () => {
    const template = {
      id: "kitchen",
      form: kitchen,
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    // answers.json stores the answers as a JSON string under the `answers` key
    const rawAnswers = JSON.parse((answersFixture as unknown as { answers: string }).answers);

    const mapped = mapAnswers({ template, rawAnswers });

    // eslint-disable-next-line no-console
    console.log("mapped", JSON.stringify(mapped, null, 2));

    // just using to check we got something back for now -- will add proper tests
    expect(Array.isArray(mapped)).toBe(true);
  });
});
