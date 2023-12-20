import React, { useMemo, useCallback, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { PageNode } from "./PageNode";

export const FlowInner = () => {
  const nodeTypes = useMemo(() => ({ pageNode: PageNode }), []);

  const initialNodes = [
    { id: "0", position: { x: 100, y: 300 }, data: { label: "1" }, type: "input" },
    // { id: "2", type: "pageNode", position: { x: 300, y: 200 }, data: { label: "2" } },
   //  { id: "3", type: "pageNode", position: { x: 300, y: 400 }, data: { label: "3" } },
  ];

  const initialEdges = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: "step",
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      type: "step",
    },
  ];

  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  let id = 1;
  const getId = () => `${id++}`;

  const onConnect = useCallback((params) => {
    // reset the start node on connections
    connectingNodeId.current = null;
    setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains("react-flow__pane");

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
          
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat({ id, source: connectingNodeId.current, target: id }));
      }
    },
    [screenToFlowPosition, getId, setNodes, setEdges, connectingNodeId]
  );

  return (
    <div style={{ height: "800px", flexGrow: 1 }} ref={reactFlowWrapper}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={[0.5, 0]}
      />
    </div>
  );
};

export const Flow = () => {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
};
