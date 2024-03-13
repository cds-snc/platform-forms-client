import { useMemo } from "react";
import { SimpleTree } from "react-arborist";
import { CreateHandler, DeleteHandler, MoveHandler, RenameHandler } from "react-arborist";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store";

export interface updateObj<T> {
  id: string;
  changes: Partial<T>;
}

import { FormItem } from "../types";

let nextId = 0;

export function useDynamicTree<T extends FormItem>() {
  const { groups, addGroup, setGroups } = useGroupStore((s) => ({
    groups: s.getGroups(),
    addGroup: s.addGroup,
    setGroups: s.setGroups,
  }));

  const tree = useMemo(() => new SimpleTree<FormItem>(groups), [groups]);

  const onMove: MoveHandler<T> = (args: {
    dragIds: string[];
    parentId: null | string;
    index: number;
  }) => {
    for (const id of args.dragIds) {
      tree.move({ id, parentId: args.parentId, index: args.index });
    }

    setGroups(tree.data);
  };

  const onRename: RenameHandler<T> = ({ name, id }) => {
    tree.update({ id, changes: { name } } as updateObj<T>);
    setGroups(tree.data);
  };

  const onCreate: CreateHandler<T> = ({ parentId, index, type }) => {
    const data = { id: `simple-tree-id-${nextId++}`, name: "" } as T;
    if (type === "internal") data.children = [];
    tree.create({ parentId, index, data });
    setGroups(tree.data);
    return data;
  };

  const onDelete: DeleteHandler<T> = (args: { ids: string[] }) => {
    args.ids.forEach((id) => tree.drop({ id }));
    setGroups(tree.data);
  };

  const controllers = { onMove, onRename, onCreate, onDelete };

  return { groups, addGroup, setGroups, controllers } as const;
}
