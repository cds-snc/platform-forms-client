import { isValidGovEmail } from "../tsUtils";
import emailDomains from "../../email.domains.json";

describe("Gov Email domain validator", () => {
  it("Should return false with an empty string passed as email", async () => {
    expect(isValidGovEmail("", "{}")).toBeFalsy();
  });

  it("Should return false with an undefined domain list", async () => {
    expect(isValidGovEmail("test@gc.ca", undefined)).toBeFalsy();
  });

  it("Should return false with an wrong email format", async () => {
    expect(isValidGovEmail("wrongEmailformat.gc.ca", "")).toBeFalsy();
  });

  it("Should return false with an empty domain list", async () => {
    expect(isValidGovEmail("testt@gc.ca", '{"domains": []}')).toBeFalsy();
  });

  it("Should return true by validating an valid email against GC's domains", async () => {
    expect(isValidGovEmail("test@canada.ca", emailDomains.domains)).toBeTruthy();
  });

  it("Should return true : the given email is a valid Gov email", async () => {
    expect(isValidGovEmail("test@canada.ca", ["gc.ca", "canada.ca", "cds-snc.ca"])).toBeTruthy();
  });
});
