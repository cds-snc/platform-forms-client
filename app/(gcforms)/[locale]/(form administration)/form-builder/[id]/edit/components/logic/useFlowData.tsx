import { useMemo } from "react";
import { Edge } from "reactflow";
import { TreeItem } from "react-complex-tree";

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

export const useFlowData = () => {
  const getGroups = useGroupStore((s) => s.getGroups);
  const treeItems = getGroups();
  const formGroups = useTemplateStore((s) => s.form.groups);

  const { edges, nodes } = useMemo(() => {
    let prevNodeId: string = "start";
    let x_pos = 50;
    let y_pos = 50;
    const edges: Edge[] = [];
    const children = treeItems.root.children;

    if (!children) {
      return { edges, nodes: [] };
    }

    const nodes = children.map((key, i) => {
      const treeItem = treeItems[key];
      const group: Group | undefined = formGroups && formGroups[key] ? formGroups[key] : undefined;
      const id = treeItem.index as string;

      let elements: TreeItem[] = [];

      if (key === "start") {
        elements = startElements;
      }

      if (treeItem.children && treeItem.children.length > 0) {
        elements = treeItem.children.map((childId) => {
          return treeItems[childId];
        });
      }

      const flowNode = {
        id,
        position: key === "start" ? { x: x_pos, y: y_pos } : { x: x_pos, y: y_pos + 100 },
        data: { label: treeItem.data, children: elements },
        type: "groupNode",
      };

      x_pos += 350;

      if (prevNodeId && group && typeof group.nextAction === "string") {
        // Add edge from this node to next action
        edges.push({
          id: `e-${i}`,
          source: id,
          target: group.nextAction,
        });
      }

      if (prevNodeId && group && Array.isArray(group.nextAction)) {
        // Add edges for next actions
        const nextActions = group.nextAction;
        nextActions.forEach((action: NextActionRule, j) => {
          edges.push({
            id: `e-arr-${i}-${j}`,
            source: id,
            target: action.groupId,
          });
        });

        x_pos -= 350;
        y_pos += 200;
      }

      if (prevNodeId && group && typeof group.nextAction === "undefined") {
        // Add edge from this node to end node
        edges.push({
          id: `e-end-${i}`,
          source: id,
          target: "end",
        });
      }

      prevNodeId = id;
      return flowNode;
    });

    // Push down the end node
    nodes.push({ ...endNode, position: { x: x_pos, y: y_pos + 200 } });

    return { edges, nodes };
  }, [treeItems, formGroups]);

  return { edges, nodes };
};
