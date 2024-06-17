"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction,
  useEffect,
  useState,
  useRef,
} from "react";

import ReactFlow, {
  Controls,
  useStoreApi,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  ReactFlowInstance,
} from "reactflow";

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
  redraw?: () => void;
}

const Flow: ForwardRefRenderFunction<unknown, FlowProps> = ({ children }, ref) => {
  const { nodes: flowNodes, edges: flowEdges, getData } = useFlowData();
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(flowEdges);
  const { fitView } = useReactFlow();
  const reset = useRef(false);
  const [redrawing, setRedrawing] = useState(true);
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
    setRedrawing(false);
  }, []);

  useEffect(() => {
    let flowZoom = 0.5;
    if (rfInstance && reset.current === false) {
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
    },
    redraw: () => {
      reset.current = true;
      const { edges } = getData();
      setEdges(edges);
      setRedrawing(true);
      const reLayout = async () => {
        await runLayout();
        setRedrawing(false);
      };

      // Add a small delay to visually indicate the redraw
      setTimeout(() => {
        reLayout();
      }, 200);

      setTimeout(() => {
        reset.current = false;
      }, 2000);
    },
  }));

  if (redrawing) {
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
        onInit={(instance) => {
          // Keep a reference to the instance so we can check zoom level for fitView.
          setRfInstance(instance);
        }}
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
