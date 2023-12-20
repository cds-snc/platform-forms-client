import React from "react";
import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import { PlusHandle } from "./PlusHandle";

export const PageNode = ({ data }) => {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="rounded border-1 border-slate-500 p-5">
      <Handle
        style={{ width: "39px", height: "39px", right: "-20px" }}
        type="source"
        position={Position.Right}
      >
        <div className="pointer-events-none">
          <PlusHandle />
        </div>
      </Handle>
      <div>
        <div className="mr-[20px]">Test</div>
      </div>
      <Handle
        style={{
          width: "39px",
          height: "39px",
          opacity: "0",
          alignItems: "center",
          justifyContent: "center",
        }}
        type="target"
        position={Position.Left}
      />
    </div>
  );
};
