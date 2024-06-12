import { GroupsType } from "@lib/formContext";
import { TreeItems } from "../types";
import { FormElement } from "@lib/types";

export type TreeDataOptions = {
  addIntroElement?: boolean;
  addPolicyElement?: boolean;
  addConfirmationElement?: boolean;
  addSectionTitleElements?: boolean;
  reviewGroup?: boolean;
};

export const groupsToTreeData = (
  formGroups: GroupsType,
  elements: FormElement[],
  options: TreeDataOptions = {}
): TreeItems => {
  const items: TreeItems = {
    root: {
      index: "root",
      data: "Root",
      children: [],
    },
  };

  if (!formGroups) {
    return items;
  }

  for (const [key, value] of Object.entries(formGroups)) {
    const children =
      value.elements &&
      value.elements.map((id) => {
        return id;
      });

    if (!children) continue;

    const item = {
      index: key,
      isFolder: true,
      canRename: true,
      canMove: true,
      data: {
        name: formGroups[key].name,
        titleEn: formGroups[key].titleEn,
        titleFr: formGroups[key].titleFr,
        descriptionEn: "",
        descriptionFr: "",
      },
      children: children,
    };

    items[key] = item;
    items.root.children?.push(key);

    // Add section title item
    const sectionTitleKey = `section-title-${key}`;
    const sectionTitleItem = {
      index: sectionTitleKey,
      isFolder: false,
      canRename: true,
      canMove: false,
      data: {
        titleEn: formGroups[key].titleEn || "Section title",
        titleFr: formGroups[key].titleFr || "Section title",
        descriptionEn: "",
        descriptionFr: "",
      },
      children: [],
    };

    // Add section title item to the start of the children array
    if (options.addSectionTitleElements && key !== "start" && key !== "end") {
      items[sectionTitleKey] = sectionTitleItem;
      items[key].children?.unshift(sectionTitleKey);
    }

    children.forEach((childId) => {
      const element = elements.find((el) => el.id === Number(childId));
      if (!element) return;

      const childItem = {
        index: childId,
        isFolder: false,
        canRename: true,
        canMove: true,
        children: [],
        data: {
          type: element.type,
          titleEn: element.properties.titleEn,
          titleFr: element.properties.titleFr,
          descriptionEn: element.properties.descriptionEn,
          descriptionFr: element.properties.descriptionFr,
        },
      };

      items[childId] = childItem;
    });
  }

  const startChildren = [];
  const endChildren = [];

  const introItem = {
    index: "intro",
    isFolder: false,
    canRename: false,
    canMove: false,
    children: [],
    data: {
      titleEn: "Form introduction",
      titleFr: "Introduction au formulaire",
      descriptionEn: "",
      descriptionFr: "",
    },
  };

  if (options.addIntroElement) {
    items["intro"] = introItem;
    startChildren.push("intro");
  }

  const policyItem = {
    index: "policy",
    isFolder: false,
    canRename: false,
    canMove: false,
    children: [],
    data: {
      titleEn: "Privacy statement",
      titleFr: "Avis de confidentialité",
      descriptionEn: "",
      descriptionFr: "",
    },
  };

  if (options.addPolicyElement) {
    items["policy"] = policyItem;
    startChildren.push("policy");
  }

  if (startChildren.length > 0 && items["start"]?.children) {
    // Add startChildren to existing start children
    const currentStartChildren = items["start"]?.children ? items["start"].children : [];
    items["start"].children = [...startChildren, ...currentStartChildren];
  }

  // ----

  const confirmationItem = {
    index: "confirmation",
    isFolder: false,
    canRename: false,
    canMove: false,
    children: [],
    data: {
      titleEn: "Confirmation message",
      titleFr: "Message de confirmation",
      descriptionEn: "",
      descriptionFr: "",
    },
  };

  if (options.addConfirmationElement) {
    items["confirmation"] = confirmationItem;
    endChildren.push("confirmation");
  }

  if (endChildren.length > 0 && items["end"]?.children) {
    items["end"].children = endChildren;
  }

  if (options.reviewGroup === false) {
    items.root.children = items.root.children?.filter((child) => child !== "review");
    delete items["review"];
  }

  return items;
};
