"use client";
import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormValues, PublicFormRecord } from "@gcforms/types";
import {
  buildElementDependencies,
  buildElementMap,
  computeAllVisibility,
  getChangedChoiceElementIds,
  recomputeAffectedVisibility,
} from "@gcforms/core";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

interface VisibilityContextValueType {
  updateValues: (values: FormValues) => void;
  isElementVisible: (elementId: string) => boolean;
}

const visibilityMapsEqual = (firstMap: Map<string, boolean>, secondMap: Map<string, boolean>) => {
  if (firstMap.size !== secondMap.size) {
    return false;
  }

  return [...firstMap].every(([id, isVisible]) => secondMap.get(id) === isVisible);
};

export const VisibilityContext = createContext<VisibilityContextValueType | undefined>(undefined);

export const VisibilityProvider = memo(function VisibilityProvider({
  formRecord,
  children,
}: {
  formRecord: PublicFormRecord;
  children: ReactNode;
}) {
  const { Event } = useCustomEvent();
  const previousValues = useRef<FormValues>({});

  const elementDependencies = useMemo(
    () => buildElementDependencies(formRecord.form.elements),
    [formRecord.form.elements]
  );

  const elementMap = useMemo(
    () => buildElementMap(formRecord.form.elements),
    [formRecord.form.elements]
  );

  const [visibilityMap, setVisibilityMap] = useState(() => computeAllVisibility(formRecord, {}));

  const visibilityMapRef = useRef(visibilityMap);

  const updateValues = useCallback(
    (values: FormValues) => {
      const changedChoiceIds = getChangedChoiceElementIds(
        previousValues.current,
        values,
        formRecord.form.elements,
        elementDependencies,
        elementMap
      );

      previousValues.current = values;

      if (changedChoiceIds.length === 0) {
        return;
      }

      const previousVisibilityMap = visibilityMapRef.current;
      const updatedVisibility = recomputeAffectedVisibility(
        formRecord,
        values,
        changedChoiceIds,
        elementDependencies,
        previousVisibilityMap,
        elementMap
      );

      const visibilityChanged = !visibilityMapsEqual(updatedVisibility, previousVisibilityMap);

      visibilityMapRef.current = updatedVisibility;
      if (visibilityChanged) {
        setVisibilityMap(updatedVisibility);
      }

      const visibilityChanges: Record<string, boolean> = {};
      updatedVisibility.forEach((isVisible, id) => {
        if (previousVisibilityMap.get(id) !== isVisible) {
          visibilityChanges[id] = isVisible;
        }
      });

      queueMicrotask(() => {
        Event.fire(EventKeys.formValuesChanged, {
          changedChoiceIds,
          visibilityChanges,
          values,
        });
      });
    },
    [Event, elementDependencies, elementMap, formRecord]
  );

  const isElementVisible = useCallback(
    (elementId: string) => visibilityMap.get(elementId) ?? true,
    [visibilityMap]
  );

  const value = useMemo(
    () => ({ updateValues, isElementVisible }),
    [updateValues, isElementVisible]
  );

  return <VisibilityContext.Provider value={value}>{children}</VisibilityContext.Provider>;
});

export const useVisibilityContext = () => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error("useVisibilityContext must be used within VisibilityProvider");
  }
  return context;
};
