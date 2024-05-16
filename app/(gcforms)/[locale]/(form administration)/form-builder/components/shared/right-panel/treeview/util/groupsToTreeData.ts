import { GroupsType } from "@lib/formContext";
import { TreeItems } from "../types";
import { FormElement } from "@lib/types";

export type TreeDataOptions = {
  addIntroElement?: boolean;
  addPolicyElement?: boolean;
  addConfirmationElement?: boolean;
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
        titleEn: formGroups[key].name,
        titleFr: formGroups[key].name,
        descriptionEn: "",
        descriptionFr: "",
      },
      children: children,
    };

    items[key] = item;
    items.root.children?.push(key);

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
      titleEn: "Introduction",
      titleFr: "Introduction",
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
      titleEn: "Policy",
      titleFr: "Policy",
      descriptionEn: "",
      descriptionFr: "",
    },
  };

  if (options.addPolicyElement) {
    items["policy"] = policyItem;
    startChildren.push("policy");
  }

  if (startChildren.length > 0) {
    items["start"].children = startChildren;
  }

  // ----

  const confirmationItem = {
    index: "confirmation",
    isFolder: false,
    canRename: false,
    canMove: false,
    children: [],
    data: {
      titleEn: "Confirmation",
      titleFr: "Confirmation",
      descriptionEn: "",
      descriptionFr: "",
    },
  };

  if (options.addConfirmationElement) {
    items["confirmation"] = confirmationItem;
    endChildren.push("confirmation");
  }

  if (endChildren.length > 0) {
    items["end"].children = endChildren;
  }

  return items;
};
