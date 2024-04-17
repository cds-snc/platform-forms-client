"use client";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import React from "react";
import ReactFlow, { Edge, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { TreeItem } from "react-complex-tree";
import { GroupNode } from "./GroupNode";

export const Flow = () => {
  const { getGroups } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
    };
  });

  const nodeTypes = { groupNode: GroupNode };
  const groups = getGroups();
  const children = groups.root.children;

  if (!children) {
    return <div>no groups found</div>;
  }

  let x_pos = 50;
  const y_pos = 50;
  const edges: Edge[] = [];

  let prevNodeId: string = "";

  const nodes = children.map((key) => {
    const group = groups[key];
    const id = group.index as string;

    let elements: TreeItem[] = [];

    if (group.children && group.children.length > 0) {
      elements = group.children.map((childId) => {
        return groups[childId];
      });
    } else {
      if (key === "start") {
        elements = [
          {
            data: "Inroduction",
            index: "start",
          },
          {
            data: "Privacy Policy",
            index: "privacy",
          },
        ];
      }
    }

    const obj = {
      id,
      position: { x: x_pos, y: y_pos },
      data: { label: group.data, children: elements },
      type: "groupNode",
    };

    x_pos += 275;

    if (prevNodeId) {
      edges.push({
        id: `e-${prevNodeId}-${id}`,
        source: prevNodeId,
        target: id,
        type: "smoothstep",
      });
    }

    prevNodeId = id;

    return obj;
  });

  // Add confirmation node
  nodes.push({
    id: "end",
    position: { x: x_pos, y: y_pos },
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
  });

  // Add edge from last group to confirmation node
  edges.push({
    id: `e-${prevNodeId}-end`,
    source: prevNodeId,
    target: "end",
    type: "smoothstep",
  });

  return (
    <div className="my-10 w-full border-1" style={{ height: "calc(100vh - 300px)" }}>
      <ReactFlow fitView={true} nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
