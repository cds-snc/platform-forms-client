"use client";

import React, { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useStoreApi,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";
import useAutoLayout, { type LayoutOptions } from "./useAutoLayout";
import { useFlowData } from "./useFlowData";
import { GroupNode } from "./GroupNode";
const nodeTypes = { groupNode: GroupNode };

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  pathOptions: { offset: 5 },
};

export const FormFlow = () => {
  const { nodes: initialNodes, edges: initialEdges } = useFlowData();
  const { fitView } = useReactFlow();

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // temp fix see: https://github.com/xyflow/xyflow/issues/3243
  const store = useStoreApi();
  if (process.env.NODE_ENV === "development") {
    store.getState().onError = (code) => {
      if (code === "002") {
        return;
      }
      // console.warn(message);
    };
  }

  const layoutOptions: LayoutOptions = {
    algorithm: "d3-hierarchy",
    direction: "LR",
    spacing: [50, 50],
  };

  useAutoLayout(layoutOptions);

  useEffect(() => {
    fitView();
  }, [nodes, fitView]);

  return (
    <div className="my-10 w-full border-1" style={{ height: "calc(100vh - 300px)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
