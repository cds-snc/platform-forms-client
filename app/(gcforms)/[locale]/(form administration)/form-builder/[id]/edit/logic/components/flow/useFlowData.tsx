import { useCallback, useMemo } from "react";
import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { stratify, tree } from "d3-hierarchy";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import {
  TreeItem,
  TreeItemIndex,
} from "@formBuilder/components/shared/right-panel/headless-treeview/types";
import { type Group } from "@gcforms/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";
import { Language } from "@lib/types/form-builder-types";
import {
  getEndNode,
  getReviewNode,
  getStartElements,
  getStartLabels,
} from "@lib/utils/form-builder/i18nHelpers";
import { groupsToTreeData } from "@root/lib/groups/utils/groupsToTreeData";

const LOCKED_SECTIONS = {
  START: LOCKED_GROUPS.START,
  REVIEW: LOCKED_GROUPS.REVIEW,
  END: LOCKED_GROUPS.END,
} as const;

const PAGE_WIDTH = 260;
const PAGE_HEADER_HEIGHT = 48;
const PAGE_CHILD_HEIGHT = 60;
const PAGE_CHILD_GAP = 8;
const PAGE_PADDING = 12;
const PAGE_MIN_HEIGHT = 144;
const OFFBOARD_HEIGHT = 164;
const LAYOUT_SPACING_X = 110;
const LAYOUT_SPACING_Y = 36;

type StaticChild = {
  data: string;
  index: string;
};

type FlowElementNodeData = {
  groupId: string;
  elementId?: number;
  label?: string;
};

type LayoutNode = Node<Record<string, unknown>>;

const defaultEdges = {
  end: LOCKED_SECTIONS.END,
} as const;

const lineStyle = {
  strokeWidth: 2,
  stroke: "#6366F1",
};

const arrowStyle = {
  type: MarkerType.ArrowClosed,
};

const getElementNodeId = (groupId: string, elementId: string | number) =>
  `${groupId}::element::${elementId}`;

const isStaticChild = (child: TreeItem | StaticChild): child is StaticChild =>
  !("isFolder" in child);

const getLabelName = (
  treeItem: TreeItem,
  key: TreeItemIndex,
  lang: Language,
  titleKey: "name" | "titleEn" | "titleFr"
) => {
  if (key === LOCKED_SECTIONS.START) {
    return getStartLabels()[lang];
  }

  return (treeItem.data?.[titleKey as keyof typeof treeItem.data] as string) || String(key);
};

const getChoiceLabel = (
  elements: FormElement[],
  choiceId: string,
  lang: Language
): string | undefined => {
  if (choiceId.includes("catch-all")) {
    return lang === "fr" ? "Toutes les autres options" : "All other options";
  }

  const [elementId, choiceIndex] = choiceId.split(".");
  const element = elements.find((item) => item.id === Number(elementId));

  if (!element?.properties?.choices || typeof choiceIndex === "undefined") {
    return undefined;
  }

  return element.properties.choices[Number(choiceIndex)]?.[lang];
};

const getPageHeight = (childCount: number) => {
  if (!childCount) {
    return PAGE_MIN_HEIGHT;
  }

  return Math.max(
    PAGE_MIN_HEIGHT,
    PAGE_HEADER_HEIGHT +
      PAGE_PADDING * 2 +
      childCount * PAGE_CHILD_HEIGHT +
      (childCount - 1) * PAGE_CHILD_GAP
  );
};

const rootLayoutNode: LayoutNode = {
  id: "layout-root",
  position: { x: 0, y: 0 },
  data: { label: { name: "" } },
};

const layoutPageNodes = (nodes: LayoutNode[], edges: Edge[]) => {
  if (!nodes.length) {
    return nodes;
  }

  const maxPageHeight = nodes.reduce((maxHeight, node) => {
    const nodeHeight = typeof node.style?.height === "number" ? node.style.height : PAGE_MIN_HEIGHT;
    return Math.max(maxHeight, nodeHeight);
  }, PAGE_MIN_HEIGHT);

  const layoutTree = tree<LayoutNode>()
    .nodeSize([maxPageHeight + LAYOUT_SPACING_Y, PAGE_WIDTH + LAYOUT_SPACING_X])
    .separation(() => 1);

  const hierarchy = stratify<LayoutNode>()
    .id((node) => node.id)
    .parentId((node) => {
      if (node.id === rootLayoutNode.id) {
        return undefined;
      }

      return edges.find((edge) => edge.target === node.id)?.source || rootLayoutNode.id;
    })([rootLayoutNode, ...nodes]);

  const laidOutRoot = layoutTree(hierarchy);
  const positions = new Map<string, { x: number; y: number }>();

  for (const node of laidOutRoot.descendants()) {
    if (!node.id || node.id === rootLayoutNode.id) {
      continue;
    }

    const width = (node.data.style?.width as number) ?? PAGE_WIDTH;
    const height = (node.data.style?.height as number) ?? PAGE_MIN_HEIGHT;

    positions.set(node.id, {
      x: node.y - width / 2,
      y: node.x - height / 2,
    });
  }

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position,
  }));
};

const getLinearEdge = (
  source: string,
  target: string,
  sourceLabel: string,
  targetLabel?: string
): Edge => ({
  id: `e-${source}-${target}`,
  source,
  target,
  style: {
    ...lineStyle,
  },
  markerEnd: {
    ...arrowStyle,
  },
  ariaLabel: `From ${sourceLabel} to ${targetLabel || target}`,
});

export const useFlowData = (
  lang: Language = "en",
  showReviewNode: boolean,
  hasReviewPage: boolean
) => {
  const formGroups = useTemplateStore((state) => state.form.groups);
  const formElements = useTemplateStore((state) => state.form.elements || []);
  const startElements = getStartElements(lang).map((element) => ({
    index: element.id,
    data: element.data.label,
  }));
  const reviewNode = getReviewNode(lang);
  const endNode = getEndNode(lang);

  const treeItems = groupsToTreeData(formGroups || {}, formElements, {
    reviewGroup: showReviewNode,
  });

  if (hasReviewPage) {
    endNode.type = "endNodeWithReview";
  }

  const getData = useCallback(() => {
    const edges: Edge[] = [];
    const layoutEdges: Edge[] = [];
    const pageNodes: LayoutNode[] = [];
    const childNodes: Node<FlowElementNodeData>[] = [];
    const treeIndexes = treeItems.root.children;

    if (!treeIndexes) {
      return { edges, nodes: [] };
    }

    treeIndexes.forEach((key: TreeItemIndex) => {
      if (key === LOCKED_SECTIONS.REVIEW || key === LOCKED_SECTIONS.END) {
        return;
      }

      const treeItem: TreeItem = treeItems[key];
      const group: Group | undefined = formGroups && formGroups[key] ? formGroups[key] : undefined;

      const titleKey = "name" as const;
      const label = getLabelName(treeItem, key, lang, titleKey);
      const isOffBoardSection = treeItem.data.nextAction === "exit";

      let children: Array<TreeItem | StaticChild> = [];

      if (key === LOCKED_SECTIONS.START) {
        children = [...startElements];
      }

      if (treeItem.children && treeItem.children.length > 0) {
        const groupChildren = treeItem.children
          .map((childId: TreeItemIndex) => treeItems[childId])
          .filter(Boolean) as TreeItem[];
        children = [...children, ...groupChildren];
      }

      const pageHeight = isOffBoardSection ? OFFBOARD_HEIGHT : getPageHeight(children.length);

      pageNodes.push({
        id: String(key),
        position: { x: 0, y: 0 },
        data: {
          label: {
            name: label,
          },
        },
        type: isOffBoardSection ? "offboardNode" : "groupNode",
        style: {
          width: PAGE_WIDTH,
          height: pageHeight,
        },
      });

      if (!isOffBoardSection) {
        children.forEach((child, index) => {
          const childKey = String(child.index);
          const treeChild = !isStaticChild(child) ? child : undefined;
          const elementId = treeChild ? Number(treeChild.index) : undefined;

          childNodes.push({
            id: getElementNodeId(String(key), childKey),
            type: "elementNode",
            parentId: String(key),
            extent: "parent",
            draggable: false,
            selectable: true,
            position: {
              x: PAGE_PADDING,
              y: PAGE_HEADER_HEIGHT + PAGE_PADDING + index * (PAGE_CHILD_HEIGHT + PAGE_CHILD_GAP),
            },
            style: {
              width: PAGE_WIDTH - PAGE_PADDING * 2,
              height: PAGE_CHILD_HEIGHT,
            },
            data: {
              groupId: String(key),
              elementId,
              label: isStaticChild(child) ? child.data : undefined,
            },
          });
        });
      }

      if (!group) {
        return;
      }

      const sourceLabel = group.name || label;

      if (typeof group.nextAction === "undefined") {
        edges.push(getLinearEdge(String(key), defaultEdges.end, sourceLabel, "Confirmation"));
        layoutEdges.push(getLinearEdge(String(key), defaultEdges.end, sourceLabel, "Confirmation"));
        return;
      }

      if (typeof group.nextAction === "string") {
        if (group.nextAction === "exit") {
          return;
        }

        let nextAction = group.nextAction;

        if (!showReviewNode && nextAction === LOCKED_SECTIONS.REVIEW) {
          nextAction = LOCKED_SECTIONS.END;
        }

        edges.push(
          getLinearEdge(String(key), nextAction, sourceLabel, formGroups?.[nextAction]?.name)
        );
        layoutEdges.push(
          getLinearEdge(String(key), nextAction, sourceLabel, formGroups?.[nextAction]?.name)
        );
        return;
      }

      group.nextAction.forEach((action) => {
        let nextAction = action.groupId;

        if (!showReviewNode && action.groupId === LOCKED_SECTIONS.REVIEW) {
          nextAction = LOCKED_SECTIONS.END;
        }

        const [elementId] = action.choiceId.split(".");
        const source = getElementNodeId(String(key), elementId);

        edges.push({
          id: `e-${source}-${action.choiceId}-${nextAction}`,
          source,
          target: nextAction,
          style: {
            ...lineStyle,
          },
          markerEnd: {
            ...arrowStyle,
          },
          label: getChoiceLabel(formElements, action.choiceId, lang),
          labelStyle: {
            fill: "#334155",
            fontSize: 12,
            fontWeight: 600,
          },
          ariaLabel: `From ${group.name} to ${formGroups?.[action.groupId]?.name || nextAction}`,
        });

        layoutEdges.push(
          getLinearEdge(String(key), nextAction, sourceLabel, formGroups?.[action.groupId]?.name)
        );
      });
    });

    if (showReviewNode) {
      pageNodes.push({
        ...reviewNode,
        data: {
          label: {
            name: reviewNode.data.label as string,
          },
        },
        style: {
          width: PAGE_WIDTH,
          height: PAGE_MIN_HEIGHT,
        },
      });
    }

    pageNodes.push({
      ...endNode,
      style: {
        width: PAGE_WIDTH,
        height: hasReviewPage ? 230 : 164,
      },
    });

    const laidOutPageNodes = layoutPageNodes(pageNodes, layoutEdges);

    return {
      edges,
      nodes: [...laidOutPageNodes, ...childNodes],
    };
  }, [
    treeItems,
    formGroups,
    formElements,
    startElements,
    reviewNode,
    endNode,
    lang,
    showReviewNode,
    hasReviewPage,
  ]);

  const data = useMemo(() => getData(), [getData]);

  return { ...data, getData };
};
