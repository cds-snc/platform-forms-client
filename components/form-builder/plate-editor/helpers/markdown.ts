import serialize from "./serialize";
import { Value } from "@udecode/plate";
import { plateNodeTypes } from "./remarkslate-nodetypes";

export const serializeMd = (value: Value) => {
  return serialize(
    { type: "", children: value },
    {
      nodeTypes: plateNodeTypes,
    }
  );
};
