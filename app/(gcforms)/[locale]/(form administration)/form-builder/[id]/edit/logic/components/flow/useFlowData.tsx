import { useCallback } from "react";
import { Edge, MarkerType } from "reactflow";
import { TreeItem, TreeItemIndex } from "react-complex-tree";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Group, GroupsType, NextActionRule } from "@lib/formContext";

const startElements = [
  {
    data: "Introduction",
    index: "introduction",
  },
  {
    data: "Privacy Policy",
    index: "privacy",
  },
];

const endNode = {
  id: "end",
  data: {
    label: "End",
    children: [
      {
        data: "Confirmation",
        index: "confirmation",
      },
    ],
  },
  type: "groupNode",
};

const reviewNode = {
  id: "review",
  data: {
    label: "Review",
    children: [
      {
        data: "Review",
        index: "review",
      },
    ],
  },
  type: "groupNode",
};

const defaultEdges = {
  start: "start",
  end: "end",
} as const;

const lineStyle = {
  strokeWidth: 2,
  stroke: "#6366F1",
};

const arrowStyle = {
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  color: "#6366F1",
};

const getEdges = (
  nodeId: string,
  prevNodeId: string,
  group: Group | undefined,
  groups: GroupsType | undefined
): Edge[] => {
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
    const nextAction = group.nextAction;
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
      return {
        id: `e-${nodeId}-${action.choiceId}-${action.groupId}`,
        source: nodeId,
        target: action.groupId,
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

export const useFlowData = () => {
  const getTreeData = useGroupStore((s) => s.getTreeData);
  const treeItems = getTreeData();
  const formGroups = useTemplateStore((s) => s.form.groups);

  const getData = useCallback(() => {
    const edges: Edge[] = [];
    const treeIndexes = treeItems.root.children;

    const x_pos = 0;
    const y_pos = 0;
    let prevNodeId: string = "start";

    if (!treeIndexes) {
      return { edges, nodes: [] };
    }

    const nodes = treeIndexes.map((key: TreeItemIndex) => {
      const treeItem: TreeItem = treeItems[key];
      const group: Group | undefined = formGroups && formGroups[key] ? formGroups[key] : undefined;
      let elements: TreeItem[] = [];

      if (key === "start") {
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

      const newEdges = getEdges(key as string, prevNodeId, group, formGroups);

      const flowNode = {
        id: key as string,
        position: { x: x_pos, y: y_pos },
        data: { label: treeItem.data, children: elements },
        type: "groupNode",
      };

      edges.push(...(newEdges as Edge[]));
      prevNodeId = key as string;
      return flowNode;
    });

    // Add review node
    nodes.push({ ...reviewNode, position: { x: x_pos, y: y_pos } });

    // Push "end" node to the end
    // And add confirmation element
    nodes.push({ ...endNode, position: { x: x_pos, y: y_pos } });

    return { edges, nodes };
  }, [treeItems, formGroups]);

  const { edges, nodes } = getData();

  return { edges, nodes, getData };
};
