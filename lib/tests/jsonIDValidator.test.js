import { createMocks } from "node-mocks-http";
import {
  layoutIDValidator,
  uniqueIDValidator,
  subElementsIDValidator,
} from "@lib/middleware/jsonIDValidator";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import invalidLayoutIds from "../../__fixtures__/invalidLayoutIds.json";
import duplicateElementIds from "../../__fixtures__/duplicateElementIds.json";
import invalidSubElementIds from "../../__fixtures__/invalidSubElementIds.json";

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

  it("Should pass, when all subElement IDs are unique and match the parent ID.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: validFormTemplate,
      },
    });

    const result = await subElementsIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(result).toEqual({ next: true });
  });

  it("Should return an error when detecting duplicate subElement IDs.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: duplicateElementIds,
      },
    });

    await subElementsIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain("Duplicate subElement IDs detected:");
    expect(res.statusCode).toBe(400);
  });

  it("Should return an error if subElement IDs don't match the parent ID.", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: invalidSubElementIds,
      },
    });

    await subElementsIDValidator({ jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain("Incorrect subElement IDs detected:");
    expect(res.statusCode).toBe(400);
  });

  it("JSON validator can be skipped under specific condition", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        formConfig: invalidSubElementIds,
      },
    });

    await subElementsIDValidator({ runValidationIf: () => true, jsonKey: "formConfig" })(req, res);
    expect(JSON.parse(res._getData()).error).toContain("Incorrect subElement IDs detected:");
    expect(res.statusCode).toBe(400);

    const skipResult = await subElementsIDValidator({
      runValidationIf: () => false,
      jsonKey: "formConfig",
    })(req, res);

    expect(skipResult).toEqual({ next: true });
  });
});
