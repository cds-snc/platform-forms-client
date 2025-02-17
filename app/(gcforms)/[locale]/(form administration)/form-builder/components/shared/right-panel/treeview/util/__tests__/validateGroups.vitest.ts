import { canModifyNextAction, canDeleteGroup } from "../validateGroups";
import { GroupsType } from "@lib/formContext";

describe("validateGroups utility functions", () => {
  const formGroups: GroupsType = {
    group1: {
        nextAction: "review",
        name: "",
        titleEn: "",
        titleFr: "",
        elements: []
    },
    group2: {
        nextAction: "submit",
        name: "",
        titleEn: "",
        titleFr: "",
        elements: []
    },
    group3: {
        nextAction: "review",
        name: "",
        titleEn: "",
        titleFr: "",
        elements: []
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
          elements: []
        },
        group2: {
          nextAction: "submit",
          name: "",
          titleEn: "",
          titleFr: "",
          elements: []
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
          elements: []
        },
        group2: {
          nextAction: "submit",
          name: "",
          titleEn: "",
          titleFr: "",
          elements: []
        },
      };
      expect(canDeleteGroup(singleReviewGroup, "review")).toBe(false);
    });

    it("should allow deleting a group if the current action is not review", () => {
      expect(canDeleteGroup(formGroups, "submit")).toBe(true);
    });
  });
});
