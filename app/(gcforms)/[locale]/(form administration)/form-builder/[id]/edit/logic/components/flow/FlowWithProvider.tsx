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

import "reactflow/dist/style.css";
import useAutoLayout from "./useAutoLayout";
import { useFlowData } from "./useFlowData";
import { GroupNode } from "./GroupNode";
import { OffboardNode } from "./OffboardNode";
import { layoutOptions } from "./options";
import { edgeOptions } from "./options";

import { useFlowRef } from "./provider/FlowRefProvider";
import { useRehydrate } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";

const nodeTypes = { groupNode: GroupNode, offboardNode: OffboardNode };
import { Edge } from "reactflow";

import { Loader } from "@clientComponents/globals/Loader";

const Loading = () => (
  <div className="flex h-full items-center justify-center ">
    <Loader />
  </div>
);

export interface FlowProps {
  lang: Language;
  children?: ReactElement;
  redraw?: () => void;
}

const Flow: ForwardRefRenderFunction<unknown, FlowProps> = ({ children, lang }, ref) => {
  const { nodes: flowNodes, edges: flowEdges, getData } = useFlowData(lang);
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(flowEdges as Edge[]);
  const { fitView } = useReactFlow();
  const reset = useRef(false);
  const [redrawing, setRedrawing] = useState(false);
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
      setEdges(edges as Edge[]);
    },
    redraw: () => {
      reset.current = true;
      const { edges } = getData();
      setEdges(edges as Edge[]);
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
        edges={flowEdges as Edge[]}
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

export const FlowWithProvider = ({ lang }: { lang: Language }) => {
  const { flow } = useFlowRef();

  const hasHydrated = useRehydrate();

  if (!hasHydrated) {
    // Wait for group to be available
    return null;
  }

  return (
    <ReactFlowProvider>
      <FlowWithRef key={`flow-lang-${lang}`} ref={flow} lang={lang} />
    </ReactFlowProvider>
  );
};

const FlowWithRef = forwardRef(Flow);
