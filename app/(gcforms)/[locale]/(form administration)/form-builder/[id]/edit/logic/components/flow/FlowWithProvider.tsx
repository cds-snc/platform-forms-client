"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction,
  useEffect,
  useState,
} from "react";

import ReactFlow, {
  Controls,
  useStoreApi,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowInstance,
  Background,
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
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(flowEdges);
  const { fitView } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>();

  // temp fix see: https://github.com/xyflow/xyflow/issues/3243
  const store = useStoreApi();
  if (process.env.NODE_ENV === "development") {
    store.getState().onError = (code) => {
      if (code === "002") {
        return;
      }
    };
  }

  useEffect(() => {
    let flowZoom = 0.5;
    if (rfInstance) {
      const obj = rfInstance.toObject();
      if (obj.viewport.zoom) {
        flowZoom = obj.viewport.zoom;
      }
    }

    if (flowZoom > 0.5) {
      return;
    }

    // Only fit view if the user has not zoomed in
    fitView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView, nodes]);

  const { runLayout } = useAutoLayout(layoutOptions);

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
        onInit={(instance) => {
          // Keep a reference to the instance so we can check zoom level for fitView.
          setRfInstance(instance);
        }}
      >
        <Controls />
        <Background />
        {children}
      </ReactFlow>
    </>
  );
};

export const FlowWithProvider = () => {
  const { flow } = useFlowRef();

  const hasHydrated = useRehydrate();

  if (!hasHydrated) {
    // Wait for group to be available
    return null;
  }

  return (
    <ReactFlowProvider>
      <FlowWithRef ref={flow} />
    </ReactFlowProvider>
  );
};

const FlowWithRef = forwardRef(Flow);
