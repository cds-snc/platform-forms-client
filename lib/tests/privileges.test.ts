/**
 * @jest-environment node
 */

import { interpolatePermissionCondition } from "@lib/privileges";

describe("Provided values can be interpolated in permission condition", () => {
  it("Should succeed if condition does not require any interpolation", async () => {
    const condition = { "formConfig.something": false };

    const result = interpolatePermissionCondition(condition, {
      userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
    });

    const expectedResult = { "formConfig.something": false };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should succeed if condition requires one value to be interpolated", async () => {
    const condition = { userId: "${userId}" };

    const result = interpolatePermissionCondition(condition, {
      userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
    });

    const expectedResult = { userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9" };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should succeed if condition requires one nested value to be interpolated", async () => {
    const condition = { userId: "${objectX.profile.userId}" };

    const objectX = {
      profile: {
        userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      },
    };

    const result = interpolatePermissionCondition(condition, {
      objectX,
    });

    const expectedResult = { userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9" };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should succeed if condition requires multiple values to be interpolated", async () => {
    const condition = {
      userId: "${objectX.profile.userId}",
      userLocation: "${objectY.location}",
    };

    const objectX = {
      profile: {
        userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      },
    };

    const objectY = {
      location: "Montréal",
    };

    const result = interpolatePermissionCondition(condition, {
      objectX,
      objectY,
    });

    const expectedResult = {
      userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      userLocation: "Montréal",
    };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should throw error if value to be interpolated is not provided", async () => {
    const condition = {
      userId: "${objectX.profile.userId}",
      userLocation: "${objectY.location}",
    };

    const objectX = {
      location: "Montréal",
    };

    expect(() => {
      interpolatePermissionCondition(condition, {
        objectX,
      });
    }).toThrowError(
      "Could not interpolate permission condition because of missing value (objectX.profile.userId)"
    );
  });

  it("Should throw error if object path is missing within placeholder", async () => {
    const condition = {
      userId: "${objectX.profile.userId}",
      userLocation: "${}",
    };

    const objectX = {
      profile: {
        userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      },
    };

    expect(() => {
      interpolatePermissionCondition(condition, {
        objectX,
      });
    }).toThrowError("Could not find object path in permission condition placeholder");
  });
});
