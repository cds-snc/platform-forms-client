import { getUsers, adminRole } from "@lib/users";
import { prismaMock } from "@jestUtils";

describe("User query tests should fail gracefully", () => {
  it("getUsers should fail silenty", async () => {
    prismaMock.user.findMany.mockRejectedValue(new Error("Test Error"));
    const result = await getUsers();
    expect(result).toHaveLength(0);
  });
  it("adminRole should fail gracefully", async () => {
    prismaMock.user.update.mockRejectedValue(new Error("Test Error"));
    const result = await adminRole(false, "4");
    expect(result).toEqual([false, false]);
  });
});

describe("User query test returns correct values", () => {
  it("Returns a list of users", async () => {
    const returnedUsers = [
      {
        id: "3",
        name: "user_1",
        admin: false,
        email: "fads@asdf.ca",
        emailVerified: null,
        image: null,
      },
      {
        id: "5",
        name: "user_2",
        admin: true,
        email: "faaass@asdf.ca",
        emailVerified: null,
        image: null,
      },
    ];
    prismaMock.user.findMany.mockResolvedValue(returnedUsers);

    const result = await getUsers();
    expect(result).toMatchObject(returnedUsers);
  });
  it("Modifies an adminitrator", async () => {
    prismaMock.user.update.mockResolvedValue({
      id: "2",
      name: "user_1",
      admin: false,
      email: "faaass@asdf.ca",
      emailVerified: null,
      image: null,
    });

    const result = await adminRole(false, "2");
    expect(
      prismaMock.user.update.calledWith({
        where: {
          id: "2",
        },
        data: {
          admin: false,
        },
      })
    );

    expect(result).toMatchObject([true, true]);
  });
});
