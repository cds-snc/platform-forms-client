"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ReactElement,
  ForwardRefRenderFunction
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

export const Flow = () => {
  const { nodes: flowNodes, edges: flowEdges } = useFlowData();
  const { fitView } = useReactFlow();
  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  const { flow } = useFlowRef();

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

  const updateEdges = useCallback(() => {
    setEdges(flowEdges);
    fitView();
    flow.current.updateEdges();
  }, [fitView, flowEdges, setEdges, flow]);

  useEffect(() => {
    fitView();
  }, [nodes, fitView]);

  return (
    <div
      className="my-10 w-full border-1"
      style={{ height: "calc(100vh - 300px)" }}
    >
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
      <button onClick={updateEdges}>update</button>
    </div>
  );
};

export const FlowWithProvider = () => {

  const { flow } = useFlowRef();

  return (
    <ReactFlowProvider>
      <WrappedFlowRefProvider ref={flow}>
        <Flow />
      </WrappedFlowRefProvider>
    </ReactFlowProvider >
  );
};

export interface FlowRefProviderProps {
  children?: ReactElement;
  updateEdges?: () => void;
}

const FlowRefProvider: ForwardRefRenderFunction<unknown, FlowRefProviderProps> = (
  { children },
  ref
) => {

  useImperativeHandle(ref, () => ({
    updateEdges: () => { alert("updateEdges the edges"); },
  }
  ));

  return <>{children}</>;
}

const WrappedFlowRefProvider = forwardRef(FlowRefProvider);