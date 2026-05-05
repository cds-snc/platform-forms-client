import { initStore } from "../initStore";

describe("initStore", () => {
  it("initializes default groups for new grouped forms", () => {
    const store = initStore({ allowGroupsFlag: true, locale: "en" });

    expect(store.form.groups).toMatchObject({
      start: expect.any(Object),
      review: expect.any(Object),
      end: expect.any(Object),
    });
    expect(store.form.groupsLayout).toEqual([]);
  });
});