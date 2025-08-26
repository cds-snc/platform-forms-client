import { useCallback } from "react";
import { MarkerType } from "reactflow";
import { TreeItem, TreeItemIndex } from "react-complex-tree";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Group, GroupsType } from "@gcforms/types";
import { type NextActionRule } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";
import { getReviewNode, getStartElements, getEndNode } from "@lib/utils/form-builder/i18nHelpers";
import { getStartLabels } from "@lib/utils/form-builder/i18nHelpers";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";

interface CustomEdge {
  id: string;
  source: string;
  target: string;
  style: {
    strokeWidth: number;
    stroke: string;
  };
  markerEnd: {
    type: string | MarkerType;
    width?: number | undefined;
    height?: number | undefined;
    color?: string | undefined;
  };
  ariaLabel: string;
}

const defaultEdges = {
  start: "start",
  end: "end",
} as const;

const lineStyle = {
  strokeWidth: 2,
  stroke: "#6366F1",
};

const arrowStyle = {
  type: "1__type=gc-arrow-closed",
};

const getEdges = (
  nodeId: string,
  prevNodeId: string,
  group: Group | undefined,
  groups: GroupsType | undefined,
  showReviewNode: boolean
): CustomEdge[] => {
  // Connect to end node as we don't have a next action
  if (prevNodeId && group && typeof group.nextAction === "undefined") {
    const fromGroup = group?.[nodeId as keyof typeof group];
    const fromName = fromGroup?.["name" as keyof typeof fromGroup];
    return [
      {
        id: `e-${nodeId}-end`,
        source: nodeId,
        target: defaultEdges.end,
        style: {
          ...lineStyle,
        },
        markerEnd: {
          ...arrowStyle,
        },
        ariaLabel: `From ${fromName} to Confirmation`,
      },
    ];
  }

  // Add edge from this node to next action
  if (prevNodeId && group && typeof group.nextAction === "string") {
    let nextAction = group.nextAction;

    if (!showReviewNode && nextAction === LockedSections.REVIEW) {
      nextAction = LockedSections.END;
    }

    return [
      {
        id: `e-${nodeId}-${nextAction}`,
        source: nodeId,
        target: nextAction,
        style: {
          ...lineStyle,
        },
        markerEnd: {
          ...arrowStyle,
        },
        ariaLabel: `From ${group.name} to ${groups?.[nextAction]?.name}`,
      },
    ];
  }

  // Add edges for multiple next actions
  if (prevNodeId && group && Array.isArray(group.nextAction)) {
    const nextActions = group.nextAction;
    const edges = nextActions.map((action: NextActionRule) => {
      let nextAction = action.groupId;

      if (!showReviewNode && action.groupId === LockedSections.REVIEW) {
        nextAction = LockedSections.END;
      }

      return {
        id: `e-${nodeId}-${action.choiceId}-${nextAction}`,
        source: nodeId,
        target: nextAction,
        style: {
          ...lineStyle,
        },
        markerEnd: {
          ...arrowStyle,
        },
        ariaLabel: `From ${group.name} to ${groups?.[action.groupId]?.name}`,
      };
    });

    return edges;
  }

  return [];
};

export const useFlowData = (
  lang: Language = "en",
  showReviewNode: boolean,
  hasReviewPage: boolean
) => {
  const getTreeData = useGroupStore((s) => s.getTreeData);
  const treeItems = getTreeData();
  const formGroups = useTemplateStore((s) => s.form.groups);
  const startElements = getStartElements(lang);
  const reviewNode = getReviewNode(lang);
  const endNode = getEndNode(lang);

  if (hasReviewPage) {
    endNode.type = "endNodeWithReview";
  }

  const getData = useCallback(() => {
    const edges: CustomEdge[] = [];
    const treeIndexes = treeItems.root.children;

    const x_pos = 0;
    const y_pos = 0;
    let prevNodeId: string = LockedSections.START;

    if (!treeIndexes) {
      return { edges, nodes: [] };
    }

    const nodes = [];

    treeIndexes.forEach((key: TreeItemIndex) => {
      const treeItem: TreeItem = treeItems[key];
      const group: Group | undefined = formGroups && formGroups[key] ? formGroups[key] : undefined;
      let elements: TreeItem[] = [];

      if (key === LockedSections.START) {
        // Add "default" start elements
        // introduction, privacy
        elements = startElements;
      }

      if (treeItem.children && treeItem.children.length > 0) {
        const children = treeItem.children.map((childId) => {
          return treeItems[childId];
        });
        elements = [...elements, ...children];
      }

      const newEdges = getEdges(key as string, prevNodeId, group, formGroups, showReviewNode);

      const titleKey = "name" as keyof typeof treeItem.data;

      const isOffBoardSection = treeItem.data.nextAction === "exit";

      let label = treeItem.data[titleKey];

      if (key === LockedSections.START) {
        // Ensure start label is displayed in the correct language
        label = getStartLabels()[lang];
      }

      const flowNode = {
        id: key as string,
        position: { x: x_pos, y: y_pos },
        data: {
          label,
          children: elements,
          nextAction: treeItem.data.nextAction,
        },
        type: isOffBoardSection ? "offboardNode" : "groupNode",
      };

      edges.push(...(newEdges as CustomEdge[]));
      prevNodeId = key as string;

      if (key === LockedSections.REVIEW || key === LockedSections.END) {
        return;
      }
      nodes.push(flowNode);
    });

    // Add review node
    if (showReviewNode) {
      nodes.push({ ...reviewNode });
    }

    // Push "end" node to the end
    // And add confirmation element
    nodes.push({ ...endNode });

    return { edges, nodes };
  }, [treeItems, reviewNode, endNode, formGroups, startElements, lang, showReviewNode]);

  const { edges, nodes } = getData();

  return { edges, nodes, getData };
};
