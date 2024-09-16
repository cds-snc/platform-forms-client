import { GroupsType } from "@lib/formContext";
import { TreeItems } from "../types";
import { FormElement } from "@lib/types";
import { resetLockedSections } from "@lib/formContext";

export type TreeDataOptions = {
  addIntroElement?: boolean;
  addPolicyElement?: boolean;
  addConfirmationElement?: boolean;
  addSectionTitleElements?: boolean;
  reviewGroup?: boolean;
};

export const subElementsToTreeData = (parentId: number, subElements: FormElement[]) => {
  const items = [];

  let subIndex = 0;

  for (const element of subElements) {
    const item = {
      index: element.id.toString(),
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
        isSubElement: true,
        parentId: parentId,
        subIndex: subIndex,
      },
    };

    items.push(item);
    subIndex++;
  }

  return items;
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

  // Reset locked sections to ensure they are in the correct order
  formGroups = formGroups && resetLockedSections(formGroups);

  const startChildren = [];
  const endChildren = [];

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
        nextAction: formGroups[key].nextAction,
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
        titleFr: formGroups[key].titleFr || "Titre de section",
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

      // Build tree data for sub elements if they exist
      const itemChildren: string[] = [];

      if (element.properties.subElements && element.properties.subElements.length > 0) {
        const treeItems = subElementsToTreeData(element.id, element.properties.subElements);

        for (const treeItem of treeItems) {
          items[treeItem.index] = treeItem;
          itemChildren.push(treeItem.index);
        }
      }

      const childItem = {
        index: childId,
        isFolder: itemChildren.length > 0,
        canRename: true,
        canMove: true,
        children: itemChildren,
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
