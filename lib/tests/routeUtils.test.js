import {
  getPageClassNames,
  getPageNameUrl,
  isSplashPage,
} from "../routeUtils";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "/",
    };
  },
}));

describe("Test route utils", () => {
  test("Determines whether we're on the splash page", () => {
    const isSplashPageResult = isSplashPage();
    expect(isSplashPageResult).toBe(true);
  });

  test("Checks if the correct pageName is returned for splash page", () => {
    const pageName = getPageNameUrl();
    expect(pageName).toEqual("splash");
  });

  test("Checks if the correct className appears on the splash page", () => {
    const pageClassNames = getPageClassNames();
    expect(pageClassNames).toEqual("outer-container pagesplash");
  });
});
