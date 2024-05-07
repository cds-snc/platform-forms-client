"use client";

import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction,
} from "react";

import ReactFlow, {
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
import { useRehydrate } from "@lib/store/useTemplateStore";

const nodeTypes = { groupNode: GroupNode };

export interface FlowProps {
  children?: ReactElement;
  updateEdges?: () => void;
}

const Flow: ForwardRefRenderFunction<unknown, FlowProps> = ({ children }, ref) => {
  const { nodes: flowNodes, edges: flowEdges, getData } = useFlowData();
  const { fitView } = useReactFlow();
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // temp fix see: https://github.com/xyflow/xyflow/issues/3243
  const store = useStoreApi();
  if (process.env.NODE_ENV === "development") {
    store.getState().onError = (code) => {
      if (code === "002") {
        return;
      }
    };
  }

  const { runLayout } = useAutoLayout(layoutOptions);

  useEffect(() => {
    fitView();
  }, [nodes, fitView]);

  useImperativeHandle(ref, () => ({
    updateEdges: () => {
      const { edges } = getData();
      setEdges(edges);
      runLayout();
    },
  }));

  return (
    <>
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={flowEdges}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={edgeOptions}
      >
        <Controls />
        {children}
      </ReactFlow>
    </>
  );
};

export const FlowWithProvider = () => {
  const { flow } = useFlowRef();

  const hasHydrated = useRehydrate();

  if (!hasHydrated) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <FlowWithRef ref={flow} />
    </ReactFlowProvider>
  );
};

const FlowWithRef = forwardRef(Flow);
