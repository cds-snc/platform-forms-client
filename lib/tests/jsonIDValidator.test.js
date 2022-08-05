import { createMocks } from "node-mocks-http";
import { layoutIDValidator, uniqueIDValidator } from "@lib/middleware/jsonIDValidator";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import invalidLayoutIds from "../../__fixtures__/invalidLayoutIds.json";
import duplicateElementIds from "../../__fixtures__/duplicateElementIds.json";

describe("Test JSON ID validation scenarios", () => {
  it("Should pass, with all layout IDs found in the elements array.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: validFormTemplate,
      },
    });

    const result = await layoutIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(result).toEqual({ next: true });
  });

  it("Should return an error when layout IDs are missing from elements array.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: invalidLayoutIds,
      },
    });

    await layoutIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain("Layout IDs not found:");
    expect(res.statusCode).toBe(400);
  });

  it("Should pass, with all IDs in the elements array being unique.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: validFormTemplate,
      },
    });

    const result = await uniqueIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(result).toEqual({ next: true });
  });

  it("Should return an error when duplicate IDs are detected in the elements array.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: duplicateElementIds,
      },
    });

    await uniqueIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain("Duplicate IDs detected:");
    expect(res.statusCode).toBe(400);
  });
});
