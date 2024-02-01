/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { MiddlewareReturn } from "@lib/types";
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
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next }: MiddlewareReturn = await layoutIDValidator({ jsonKey: "formConfig" })(req, {
      formConfig: validFormTemplate,
    });

    expect(next).toBe(true);
  });

  it("Should return an error when layout IDs are missing from elements array.", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next, response }: MiddlewareReturn = await layoutIDValidator({ jsonKey: "formConfig" })(
      req,
      {
        formConfig: invalidLayoutIds,
      }
    );
    expect(next).toEqual(false);
    expect((await response?.json())?.error).toContain("Layout IDs not found:");
  });

  it("Should pass, with all IDs in the elements array being unique.", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next }: MiddlewareReturn = await uniqueIDValidator({ jsonKey: "formConfig" })(req, {
      formConfig: validFormTemplate,
    });

    expect(next).toBe(true);
  });

  it("Should return an error when duplicate IDs are detected in the elements array.", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next, response }: MiddlewareReturn = await uniqueIDValidator({
      jsonKey: "formConfig",
    })(req, {
      formConfig: duplicateElementIds,
    });
    expect(next).toEqual(false);
    expect((await response?.json())?.error).toContain("Duplicate IDs detected:");
  });

  it("Should pass, when all subElement IDs are unique and match the parent ID.", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next }: MiddlewareReturn = await subElementsIDValidator({ jsonKey: "formConfig" })(
      req,
      {
        formConfig: validFormTemplate,
      }
    );
    expect(next).toBe(true);
  });

  it("Should return an error when detecting duplicate subElement IDs.", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    const { next, response }: MiddlewareReturn = await subElementsIDValidator({
      jsonKey: "formConfig",
    })(req, {
      formConfig: duplicateElementIds,
    });
    expect(next).toEqual(false);
    expect((await response?.json())?.error).toContain("Duplicate subElement IDs detected:");
  });

  it("Should return an error if subElement IDs don't match the parent ID.", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next, response }: MiddlewareReturn = await subElementsIDValidator({
      jsonKey: "formConfig",
    })(req, {
      formConfig: invalidSubElementIds,
    });
    expect(next).toEqual(false);
    expect((await response?.json())?.error).toContain("Incorrect subElement IDs detected:");
  });

  it("JSON validator can be skipped under specific condition", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const { next, response }: MiddlewareReturn = await subElementsIDValidator({
      runValidationIf: () => Promise.resolve(true),
      jsonKey: "formConfig",
    })(req, {
      formConfig: invalidSubElementIds,
    });

    expect(next).toEqual(false);
    expect((await response?.json())?.error).toContain("Incorrect subElement IDs detected:");

    const skipResult = await subElementsIDValidator({
      runValidationIf: () => Promise.resolve(false),
      jsonKey: "formConfig",
    })(req, {
      formConfig: invalidSubElementIds,
    });

    expect(skipResult).toEqual({ next: true });
  });
});
