import { cleanPath } from "../hooks/useActivePathname";

it("removes id from path", () => {
  expect(cleanPath("/form-builder/settings")).toBe("/form-builder/settings");
  expect(cleanPath(`/form-builder/settings/clawwjklm05188cygx45fkihp`)).toBe(
    "/form-builder/settings"
  );
  expect(cleanPath(`/form-builder/edit/clatrihnk19288ayfb6zpg53j`)).toBe("/form-builder/edit");
  expect(cleanPath()).toBe("");
  expect(new URL("https://example.com/settings", "https://example.com").pathname).toBe("/settings");
});
