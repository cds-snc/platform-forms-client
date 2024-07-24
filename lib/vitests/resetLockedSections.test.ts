import { FormProperties } from "@lib/types";
import { resetLockedSections } from "@lib/formContext";
import validFormTemplate from "../../__fixtures__/sections-out-of-order.json";
import { GroupsType } from "@lib/formContext";
describe("resetLockedSections function", () => {
  it("Resets locked sections", () => {
    const form = validFormTemplate as FormProperties;
    const result = resetLockedSections(form.groups as GroupsType) as GroupsType;

    expect(result).toBeDefined();

    const start = result?.start;
    const review = result?.review;
    const end = result?.end;

    expect(start).toBeDefined();
    expect(review).toBeDefined();
    expect(end).toBeDefined();

    expect(start?.nextAction).toBe("3a426f36-bd26-4b82-9556-6a9c26513bb1");
    expect(review?.nextAction).toBe("end");

    // Ensure end is the last key in the object
    const keys = Object.keys(result);

    // Ensure start is the first key in the object
    expect(keys[0]).toBe("start");

    // Ensure review is before end
    expect(keys[keys.length - 2]).toBe("review");

    // Ensure end is the last key in the object
    expect(keys[keys.length - 1]).toBe("end");
  });
});