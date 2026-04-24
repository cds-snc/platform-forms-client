"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  ReactFlow,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  useOnViewportChange,
  type Viewport,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useFlowData } from "./useFlowData";
import { GroupNode } from "./GroupNode";
import { ElementNode } from "./ElementNode";
import { OffboardNode } from "./OffboardNode";
import { EndNode } from "./EndNode";
import { EndNodeWithReview } from "./EndNodeWithReview";
import { FlowEdge } from "./FlowEdge";
import { edgeOptions } from "./options";

import { useFlowRef } from "./provider/FlowRefProvider";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { Language } from "@lib/types/form-builder-types";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { showReviewPage as hasReviewPage } from "@lib/utils/form-builder/showReviewPage";

import { Loader } from "@clientComponents/globals/Loader";

const Loading = () => (
  <div className="flex h-full items-center justify-center">
    <Loader />
  </div>
);

export interface FlowProps {
  lang: Language;
  children?: ReactElement;
  redraw?: () => void;
}

const Flow: ForwardRefRenderFunction<unknown, FlowProps> = ({ children, lang }, ref) => {
  "use memo";
  const form = useTemplateStore((state) => state.form);
  const nodeTypes = useMemo(
    () => ({
      groupNode: GroupNode,
      elementNode: ElementNode,
      offboardNode: OffboardNode,
      endNode: EndNode,
      endNodeWithReview: EndNodeWithReview,
    }),
    []
  );
  const edgeTypes = useMemo(
    () => ({
      flowEdge: FlowEdge,
    }),
    []
  );

  const showReviewNode = false;
  const hasReview = hasReviewPage(form);

  const {
    nodes: flowNodes,
    edges: flowEdges,
    getData,
  } = useFlowData(lang, showReviewNode, hasReview);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges as Edge[]);
  const reset = useRef(false);
  const [redrawing, setRedrawing] = useState(false);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const flowSignature = JSON.stringify({
    nodes: flowNodes.map((node) => ({
      id: node.id,
      parentId: node.parentId,
      position: node.position,
      type: node.type,
      width: node.style?.width,
      height: node.style?.height,
      data: node.data,
    })),
    edges: flowEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      zIndex: edge.zIndex,
      markerColor:
        edge.markerEnd && typeof edge.markerEnd === "object" && "color" in edge.markerEnd
          ? edge.markerEnd.color
          : undefined,
      stroke: edge.style?.stroke,
      strokeWidth: edge.style?.strokeWidth,
      opacity: edge.style?.opacity,
      labelFill: edge.labelStyle?.fill,
    })),
  });

  useOnViewportChange({
    onChange: (viewport: Viewport) => {
      setViewport(viewport);
    },
  });

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges as Edge[]);
  }, [flowSignature, flowNodes, flowEdges, setNodes, setEdges]);

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

      // Add a small delay to visually indicate the redraw
      setTimeout(() => {
        setRedrawing(false);
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
        className="h-full w-full"
        disableKeyboardA11y={true}
        nodesFocusable={false}
        edgesFocusable={false}
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={edgeOptions}
        onInit={(instance) => {
          // If the user has modified the vieport (zoom, scroll, pan) restore it
          // Otherwise use fitView to automatically zoom/center the flow
          if (viewport) {
            instance.setViewport(viewport);
          } else {
            instance.fitView({ padding: 0.02 });
          }
        }}
      >
        <Controls showInteractive={false} showZoom={true} showFitView={true} />
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
