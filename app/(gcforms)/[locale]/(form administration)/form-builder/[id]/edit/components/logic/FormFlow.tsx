"use client";

import React, { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useStoreApi,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";
import useAutoLayout from "./useAutoLayout";
import { useFlowData } from "./useFlowData";
import { GroupNode } from "./GroupNode";
import { layoutOptions } from "./options";
import { edgeOptions } from "./options";

const nodeTypes = { groupNode: GroupNode };

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
        defaultEdgeOptions={edgeOptions}
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
