"use client";

import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction,
} from "react";

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

import { useFlowRef } from "./provider/FlowRefProvider";

const nodeTypes = { groupNode: GroupNode };

export interface FlowProps {
  children?: ReactElement;
  updateEdges?: () => void;
}

const Flow: ForwardRefRenderFunction<unknown, FlowProps> = ({ children }, ref) => {
  const { nodes: flowNodes, edges: flowEdges, getData } = useFlowData();
  const { fitView } = useReactFlow();
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // temp fix see: https://github.com/xyflow/xyflow/issues/3243
  const store = useStoreApi();
  if (process.env.NODE_ENV === "development") {
    store.getState().onError = (code) => {
      if (code === "002") {
        return;
      }
    };
  }

  useAutoLayout(layoutOptions);

  useEffect(() => {
    fitView();
  }, [nodes, fitView]);

  useImperativeHandle(ref, () => ({
    updateEdges: () => {
      const { edges } = getData();
      setEdges(edges);
      fitView();
    },
  }));

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
        {children}
      </ReactFlow>
    </div>
  );
};

export const FlowWithProvider = () => {
  const { flow } = useFlowRef();
  return (
    <ReactFlowProvider>
      <FlowWithRef ref={flow} />
    </ReactFlowProvider>
  );
};

const FlowWithRef = forwardRef(Flow);
