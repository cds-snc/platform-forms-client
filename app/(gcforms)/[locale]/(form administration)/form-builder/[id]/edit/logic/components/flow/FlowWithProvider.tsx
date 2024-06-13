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

import { Loader } from "@clientComponents/globals/Loader";

const Loading = () => (
  <div className="flex h-full items-center justify-center ">
    <Loader />
  </div>
);

export interface FlowProps {
  children?: ReactElement;
  updateEdges?: () => void;
  redraw?: () => void;
}

const Flow: ForwardRefRenderFunction<unknown, FlowProps> = ({ children }, ref) => {
  const { nodes: flowNodes, edges: flowEdges, getData } = useFlowData();
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(flowEdges);
  const { fitView } = useReactFlow();
  const [redraw, setRedraw] = useState(false);

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
    fitView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView, nodes]);

  const { runLayout } = useAutoLayout(layoutOptions);

  useImperativeHandle(ref, () => ({
    updateEdges: () => {
      const { edges } = getData();
      setEdges(edges);
    },
    redraw: () => {
      setRedraw(true);
      runLayout();
      // Add a small delay to visually indicate the redraw
      setTimeout(() => {
        setRedraw(false);
      }, 300);
    },
  }));

  if (redraw) {
    return <Loading />;
  }

  return (
    <>
      <ReactFlow
        disableKeyboardA11y={true}
        nodesFocusable={false}
        edgesFocusable={false}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={flowEdges}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={edgeOptions}
      >
        <Controls showInteractive={false} showZoom={true} showFitView={false} />
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
