"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction,
  useState,
  useRef,
} from "react";

import ReactFlow, {
  Controls,
  useStoreApi,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  useOnViewportChange,
  Viewport,
} from "reactflow";

import "reactflow/dist/style.css";
import useAutoLayout from "./useAutoLayout";
import { useFlowData } from "./useFlowData";
import { GroupNode } from "./GroupNode";
import { OffboardNode } from "./OffboardNode";
import { EndNode } from "./EndNode";
import { EndNodeWithReview } from "./EndNodeWithReview";
import { layoutOptions } from "./options";
import { edgeOptions } from "./options";

import { useFlowRef } from "./provider/FlowRefProvider";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { Language } from "@lib/types/form-builder-types";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { showReviewPage as hasReviewPage } from "@lib/utils/form-builder/showReviewPage";

const nodeTypes = {
  groupNode: GroupNode,
  offboardNode: OffboardNode,
  endNode: EndNode,
  endNodeWithReview: EndNodeWithReview,
};
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
  const form = useTemplateStore((state) => state.form);

  const showReviewNode = false;
  const hasReview = hasReviewPage(form);

  const {
    nodes: flowNodes,
    edges: flowEdges,
    getData,
  } = useFlowData(lang, showReviewNode, hasReview);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(flowEdges as Edge[]);
  const reset = useRef(false);
  const [redrawing, setRedrawing] = useState(false);
  const [viewport, setViewport] = useState<Viewport | null>(null);

  // temp fix see: https://github.com/xyflow/xyflow/issues/3243
  const store = useStoreApi();
  if (process.env.NODE_ENV === "development") {
    store.getState().onError = (code) => {
      if (code === "002") {
        return;
      }
    };
  }

  useOnViewportChange({
    onChange: (viewport: Viewport) => {
      setViewport(viewport);
    },
  });

  const { runLayout } = useAutoLayout({
    ...layoutOptions,
    showReviewNode,
  });

  useImperativeHandle(ref, () => ({
    updateEdges: () => {
      const { edges } = getData();
      setEdges(edges as Edge[]);
    },
    redraw: () => {
      reset.current = true;
      const { edges, nodes } = getData();
      setEdges(edges as Edge[]);
      setNodes(nodes);
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
          // If the user has modified the vieport (zoom, scroll, pan) restore it
          // Otherwise use fitView to automatically zoom/center the flow
          if (viewport) {
            instance.setViewport(viewport);
          } else {
            instance.fitView();
          }
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
