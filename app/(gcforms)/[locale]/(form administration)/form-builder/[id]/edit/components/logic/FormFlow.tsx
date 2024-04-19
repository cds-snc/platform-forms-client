"use client";

import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useStoreApi,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useFlowData } from "./useFlowData";
import { GroupNode } from "./GroupNode";
const nodeTypes = { groupNode: GroupNode };

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  pathOptions: { offset: 5 },
};

export const FormFlow = () => {
  const { edges, nodes } = useFlowData();

  // @todo temp fix for https://github.com/xyflow/xyflow/issues/3243
  const store = useStoreApi();
  if (process.env.NODE_ENV === "development") {
    store.getState().onError = (code) => {
      if (code === "002") {
        return;
      }
      // console.warn(message);
    };
  }

  return (
    <div className="my-10 w-full border-1" style={{ height: "calc(100vh - 300px)" }}>
      <ReactFlow
        fitView={true}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export const Flow = () => {
  return (
    <ReactFlowProvider>
      <FormFlow />
    </ReactFlowProvider>
  );
};
