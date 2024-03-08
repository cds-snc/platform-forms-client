import { useMemo, useState } from "react";
import { SimpleTree } from "react-arborist";
import { CreateHandler, DeleteHandler, MoveHandler, RenameHandler } from "react-arborist";

export interface updateObj<T> {
  id: string;
  changes: Partial<T>;
}

import { FormItem } from "../types";

let nextId = 0;

export function useDynamicTree<T extends FormItem>() {
  const [data, setData] = useState<T[]>([]);
  const tree = useMemo(() => new SimpleTree<T>(data), [data]);

  const onMove: MoveHandler<T> = (args: {
    dragIds: string[];
    parentId: null | string;
    index: number;
  }) => {
    for (const id of args.dragIds) {
      tree.move({ id, parentId: args.parentId, index: args.index });
    }
    setData(tree.data);
  };

  const onRename: RenameHandler<T> = ({ name, id }) => {
    tree.update({ id, changes: { name } } as updateObj<T>);
    setData(tree.data);
  };

  const onCreate: CreateHandler<T> = ({ parentId, index, type }) => {
    const data = { id: `simple-tree-id-${nextId++}`, name: "" } as T;
    if (type === "internal") data.children = [];
    tree.create({ parentId, index, data });
    setData(tree.data);
    return data;
  };

  const onDelete: DeleteHandler<T> = (args: { ids: string[] }) => {
    args.ids.forEach((id) => tree.drop({ id }));
    setData(tree.data);
  };

  const controllers = { onMove, onRename, onCreate, onDelete };

  return { data, setData, controllers } as const;
}
