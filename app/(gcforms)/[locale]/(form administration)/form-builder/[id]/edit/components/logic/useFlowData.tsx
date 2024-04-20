import { useMemo } from "react";
import { Edge } from "reactflow";
import { TreeItem, TreeItemIndex } from "react-complex-tree";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Group, NextActionRule } from "@lib/formContext";

const startElements = [
  {
    data: "Introduction",
    index: "start",
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
        index: "end",
      },
    ],
  },
  type: "groupNode",
};

const defaultEdges = {
  start: "start",
  end: "end",
} as const;

const getEdges = (nodeId: string, prevNodeId: string, group: Group | undefined): Edge[] => {
  // Connect to end node as we don't have a next action
  if (prevNodeId && group && typeof group.nextAction === "undefined") {
    return [
      {
        id: `e-${nodeId}-end`,
        source: nodeId,
        target: defaultEdges.end,
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
      };
    });

    return edges;
  }

  return [];
};

export const useFlowData = () => {
  const getGroups = useGroupStore((s) => s.getGroups);
  const treeItems = getGroups();
  const formGroups = useTemplateStore((s) => s.form.groups);

  const { edges, nodes } = useMemo(() => {
    const edges: Edge[] = [];
    const treeIndexes = treeItems.root.children;

    let x_pos = 50;
    let y_pos = 50;
    let prevNodeId: string = "start";

    if (!treeIndexes) {
      return { edges, nodes: [] };
    }

    const nodes = treeIndexes.map((key: TreeItemIndex) => {
      const treeItem: TreeItem = treeItems[key];
      const group: Group | undefined = formGroups && formGroups[key] ? formGroups[key] : undefined;
      let elements: TreeItem[] = [];

      if (key === "start") {
        elements = startElements;
      }

      if (treeItem.children && treeItem.children.length > 0) {
        elements = treeItem.children.map((childId) => {
          return treeItems[childId];
        });
      }

      const newEdges = getEdges(key as string, prevNodeId, group);

      if (newEdges.length >= 2) {
        y_pos += 300;
      } else {
        x_pos += 300;
      }

      const flowNode = {
        id: key,
        position: { x: x_pos, y: y_pos },
        data: { label: treeItem.data, children: elements },
        type: "groupNode",
      };

      edges.push(...(newEdges as Edge[]));
      prevNodeId = key as string;
      return flowNode;
    });

    // Push down the end node
    nodes.push({ ...endNode, position: { x: x_pos, y: y_pos + 200 } });

    return { edges, nodes };
  }, [treeItems, formGroups]);

  return { edges, nodes };
};
