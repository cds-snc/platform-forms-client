import { canModifyNextAction, canDeleteGroup, createsNextActionCycle } from "../validateGroups";
import { type GroupsType } from "@gcforms/types";

describe("validateGroups utility functions", () => {
  const formGroups: GroupsType = {
    group1: {
      nextAction: "review",
      name: "",
      titleEn: "",
      titleFr: "",
      elements: [],
    },
    group2: {
      nextAction: "submit",
      name: "",
      titleEn: "",
      titleFr: "",
      elements: [],
    },
    group3: {
      nextAction: "review",
      name: "",
      titleEn: "",
      titleFr: "",
      elements: [],
    },
  };

  describe("canModifyNextAction", () => {
    it("should allow changing nextAction if there are multiple groups pointing to review", () => {
      expect(canModifyNextAction(formGroups, "review", "exit")).toBe(true);
    });

    it("should prevent changing nextAction to exit if it is the only group pointing to review", () => {
      const singleReviewGroup: GroupsType = {
        group1: {
          nextAction: "review",
          name: "",
          titleEn: "",
          titleFr: "",
          elements: [],
        },
        group2: {
          nextAction: "submit",
          name: "",
          titleEn: "",
          titleFr: "",
          elements: [],
        },
      };
      expect(canModifyNextAction(singleReviewGroup, "review", "exit")).toBe(false);
    });

    it("should allow changing nextAction if the current action is not review", () => {
      expect(canModifyNextAction(formGroups, "submit", "exit")).toBe(true);
    });
  });

  describe("canDeleteGroup", () => {
    it("should allow deleting a group if there are multiple groups pointing to review", () => {
      expect(canDeleteGroup(formGroups, "review")).toBe(true);
    });

    it("should prevent deleting a group if it is the only group pointing to review", () => {
      const singleReviewGroup: GroupsType = {
        group1: {
          nextAction: "review",
          name: "",
          titleEn: "",
          titleFr: "",
          elements: [],
        },
        group2: {
          nextAction: "submit",
          name: "",
          titleEn: "",
          titleFr: "",
          elements: [],
        },
      };
      expect(canDeleteGroup(singleReviewGroup, "review")).toBe(false);
    });

    it("should allow deleting a group if the current action is not review", () => {
      expect(canDeleteGroup(formGroups, "submit")).toBe(true);
    });
  });

  describe("createsNextActionCycle", () => {
    it("detects a page pointing to itself", () => {
      expect(createsNextActionCycle(formGroups, "group1", "group1")).toBe(true);
    });

    it("detects a page pointing back to start", () => {
      const groups: GroupsType = {
        start: { ...formGroups.group1, nextAction: "group1" },
        group1: { ...formGroups.group1, nextAction: "review" },
      };

      expect(createsNextActionCycle(groups, "group1", "start")).toBe(true);
    });

    it("detects a cycle in conditional rules", () => {
      const groups: GroupsType = {
        group1: { ...formGroups.group1, nextAction: "group2" },
        group2: { ...formGroups.group2, nextAction: "review" },
      };

      expect(
        createsNextActionCycle(groups, "group2", [{ groupId: "group1", choiceId: "1.0" }])
      ).toBe(true);
    });

    it("allows navigation to a terminal page", () => {
      expect(createsNextActionCycle(formGroups, "group1", "review")).toBe(false);
    });
  });
});
