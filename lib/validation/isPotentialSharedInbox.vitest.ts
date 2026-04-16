import { describe, expect, it } from "vitest";
import { isPotentialSharedInbox } from "./isPotentialSharedInbox";

describe("isPotentialSharedInbox", () => {
  describe("Valid personal email patterns (should return false)", () => {
    it("should accept firstname.lastname pattern", () => {
      expect(isPotentialSharedInbox("john.smith@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("marie.dubois@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("a.b@gc.ca")).toBe(false);
    });

    it("should accept firstname.last-name pattern (1 dot, 1 hyphen)", () => {
      expect(isPotentialSharedInbox("john.smith-jones@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("marie.st-pierre@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("alice.o-brien@gc.ca")).toBe(false);
    });

    it("should accept names with longer segments", () => {
      expect(isPotentialSharedInbox("christopher.montgomery@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("alexandra.beauchamp-tremblay@gc.ca")).toBe(false);
    });
  });

  describe("Flagged patterns - Multiple dots (should return true)", () => {
    it("should flag emails with more than 1 dot", () => {
      expect(isPotentialSharedInbox("school.health.grant@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("ircc.commconsultations-consultationscomm.ircc@gc.ca")).toBe(
        true
      );
      expect(isPotentialSharedInbox("a.b.c@gc.ca")).toBe(true);
    });
  });

  describe("Flagged patterns - Multiple hyphens (should return true)", () => {
    it("should flag emails with more than 2 hyphens", () => {
      expect(isPotentialSharedInbox("nc-issd-srds-com-gd@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("ia-intake_process-ia-processus_dadmission@gc.ca")).toBe(
        true
      );
      expect(isPotentialSharedInbox("team-sub-team-function@gc.ca")).toBe(true);
    });

    it("should accept emails with exactly 1 or 2 hyphens", () => {
      expect(isPotentialSharedInbox("john.smith-jones@gc.ca")).toBe(false);
    });
  });

  describe("Flagged patterns - Underscores (should return true)", () => {
    it("should flag any email containing underscores", () => {
      expect(isPotentialSharedInbox("team_function@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("nohis_support-support_sinst@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("ia-intake_process-ia-processus_dadmission@gc.ca")).toBe(
        true
      );
      expect(isPotentialSharedInbox("user_name@gc.ca")).toBe(true);
    });
  });

  describe("Flagged patterns - Single word (should return true)", () => {
    it("should flag single words with no separators", () => {
      expect(isPotentialSharedInbox("admin@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("info@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("support@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("webmaster@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("eeinfo@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("ve@gc.ca")).toBe(true);
    });
  });

  describe("Flagged patterns - Acronyms (should return true)", () => {
    it("should flag emails with mostly short segments (acronyms)", () => {
      expect(isPotentialSharedInbox("ngn-rpg@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("apm-gpa@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("sdo-bdd@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("erd-dre@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("nc-issd-srds-com-gd@gc.ca")).toBe(true);
    });

    it("should flag emails where >60% segments are ≤4 characters", () => {
      expect(isPotentialSharedInbox("abc-def@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("ab-cd-ef@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("dept.sub.team@gc.ca")).toBe(true);
    });

    it("should not flag emails with mostly long segments", () => {
      // Even though it has 1 dot, the segments are long enough to look like names
      expect(isPotentialSharedInbox("christopher.montgomery@gc.ca")).toBe(false);
    });
  });

  describe("Real shared inbox examples from the provided list", () => {
    it("should flag all real shared inbox examples", () => {
      // Multiple dots
      expect(isPotentialSharedInbox("projectalpha-betachallenge@gc.ca")).toBe(true);
      expect(
        isPotentialSharedInbox("dept.teamconsultations-consultationsgroup.dept@gc.ca")
      ).toBe(true);
      expect(
        isPotentialSharedInbox("org.divisioncomms-commsdivision.unit@gc.ca")
      ).toBe(true);

      // Underscores
      expect(
        isPotentialSharedInbox("ab-intake_process-cd-processus_admission@gc.ca")
      ).toBe(true);
      expect(isPotentialSharedInbox("surveycentreunit-centreunitsurvey@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("system_support-support_admin@gc.ca")).toBe(true);

      // Single words
      expect(isPotentialSharedInbox("contact@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("hr@gc.ca")).toBe(true);

      // Acronyms
      expect(isPotentialSharedInbox("abc-def@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("xyz-qrs@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("lmn-pqr@gc.ca")).toBe(true);

      // Multiple hyphens
      expect(isPotentialSharedInbox("ab-cdef-ghij-klm-no@gc.ca")).toBe(true);
      expect(isPotentialSharedInbox("governmentreviewunit-uniteexamengovernement@gc.ca")).toBe(
        true
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle emails with no @ symbol gracefully", () => {
      expect(isPotentialSharedInbox("notanemail")).toBe(true); // Treated as single word
    });

    it("should handle empty local part", () => {
      expect(isPotentialSharedInbox("@gc.ca")).toBe(false);
    });

    it("should handle mixed case", () => {
      expect(isPotentialSharedInbox("John.Smith@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("Admin@gc.ca")).toBe(true);
    });

    it("should not be affected by domain portion", () => {
      expect(isPotentialSharedInbox("john.smith@very-long-domain-name.gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("admin@simple.ca")).toBe(true);
    });
  });

  describe("Boundary tests for acronym detection", () => {
    it("should flag when exactly 60% are short segments", () => {
      // 3 short, 2 long = 60% short
      expect(isPotentialSharedInbox("abc-def-ghi-longer-segment@gc.ca")).toBe(true);
    });

    it("should not flag when less than 60% are short segments", () => {
      // 1 dot = 2 segments, both need to be long
      expect(isPotentialSharedInbox("christopher.montgomery@gc.ca")).toBe(false);
    });

    it("should require at least 2 segments for acronym check", () => {
      // Single segment "abcd" should be caught by single-word check, not acronym check
      expect(isPotentialSharedInbox("abcd@gc.ca")).toBe(true);
    });

    it("should flag when segments are at the 4-character boundary", () => {
      expect(isPotentialSharedInbox("abcd-efgh@gc.ca")).toBe(true); // Both exactly 4 chars
      // Note: Even with 5-char segments, hyphen-only (no dots) emails are flagged
      expect(isPotentialSharedInbox("abcde-fghij@gc.ca")).toBe(true); // No dots = flagged
    });
  });

  describe("Valid patterns that should NOT be flagged", () => {
    it("should not flag typical government employee emails", () => {
      expect(isPotentialSharedInbox("john.smith@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("marie.tremblay@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("robert.jackson@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("sarah.o-connor@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("david.st-laurent@gc.ca")).toBe(false);
    });

    it("should not flag emails with exactly 1 dot and no hyphens", () => {
      expect(isPotentialSharedInbox("firstname.lastname@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("a.b@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("verylongfirstname.verylonglastname@gc.ca")).toBe(false);
    });

    it("should not flag emails with exactly 1 dot and 1 hyphen", () => {
      expect(isPotentialSharedInbox("first.last-name@gc.ca")).toBe(false);
      expect(isPotentialSharedInbox("john.smith-jones@gc.ca")).toBe(false);
    });
  });
});
