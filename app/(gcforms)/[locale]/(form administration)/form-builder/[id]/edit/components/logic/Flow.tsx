"use client";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import React from "react";
import ReactFlow, { Edge, Position, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export const Flow = () => {
  const { getGroups } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
    };
  });

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

    const connectPosition =
      id === "start"
        ? {
            sourcePosition: Position.Right,
            targetPosition: Position.Right,
          }
        : {
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          };

    const obj = {
      id,
      position: { x: x_pos, y: y_pos },
      data: { label: group.data },
      ...connectPosition,
    };

    x_pos += 200;

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

  nodes.push({
    id: "10000",
    position: { x: x_pos, y: y_pos },
    data: { label: "confirmation" },
    targetPosition: Position.Left,
    sourcePosition: Position.Left,
  });

  edges.push({
    id: `e-${prevNodeId}-10000`,
    source: prevNodeId,
    target: "10000",
    type: "smoothstep",
  });

  return (
    <div className="my-10 w-full border-1" style={{ height: "calc(100vh - 300px)" }}>
      <ReactFlow fitView={true} nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
