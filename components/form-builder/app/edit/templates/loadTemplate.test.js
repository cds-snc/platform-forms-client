//write test for loadTemplate
import { loadTemplate } from "./loadTemplate";

describe("loadTemplate", () => {
  it("should call getTemplate", async () => {
    const result = await loadTemplate("test");
    expect(result[0].type).toEqual("radio");
    expect(result[0].properties.choices[1].fr).toEqual("Français");
  });
});
