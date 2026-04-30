"use client";

import { useEffect, useRef, type RefObject } from "react";

const ACTIVE_TAB_COORDINATION_PREFIX = "active-tab";

type ActiveTabMessage = {
  type: "claim" | "release";
  tabId: string;
};

type ActiveTabState = {
  activeTabIdRef: RefObject<string | null>;
  tabIdRef: RefObject<string>;
  isActiveTabRef: RefObject<boolean>;
};

const getTabId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isTabForeground = () => {
  if (typeof document === "undefined") {
    return true;
  }

  return document.visibilityState === "visible" && document.hasFocus();
};

const broadcastTabMessage = (coordinationChannel: BroadcastChannel, message: ActiveTabMessage) => {
  coordinationChannel.postMessage(message);
};

const claimActiveTab = (
  { activeTabIdRef, tabIdRef, isActiveTabRef }: ActiveTabState,
  coordinationChannel: BroadcastChannel
) => {
  activeTabIdRef.current = tabIdRef.current;
  isActiveTabRef.current = true;
  broadcastTabMessage(coordinationChannel, { type: "claim", tabId: tabIdRef.current });
};

const releaseActiveTab = (
  { activeTabIdRef, tabIdRef, isActiveTabRef }: ActiveTabState,
  coordinationChannel: BroadcastChannel,
  broadcast = true
) => {
  const isCurrentActive = activeTabIdRef.current === tabIdRef.current;

  if (broadcast && isCurrentActive) {
    broadcastTabMessage(coordinationChannel, { type: "release", tabId: tabIdRef.current });
  }

  if (isCurrentActive) {
    activeTabIdRef.current = null;
  }

  isActiveTabRef.current = false;
};

const attemptActiveTab = (state: ActiveTabState, coordinationChannel: BroadcastChannel) => {
  if (isTabForeground()) {
    claimActiveTab(state, coordinationChannel);
    return;
  }

  releaseActiveTab(state, coordinationChannel);
};

export const useActiveTab = ({ coordinationKey }: { coordinationKey: string }) => {
  "use memo";
  const coordinationChannelRef = useRef<BroadcastChannel | null>(null);
  const activeTabIdRef = useRef<string | null>(null);
  const tabIdRef = useRef<string>(getTabId());
  const isActiveTabRef = useRef(isTabForeground());
  const coordinationChannelName = `${ACTIVE_TAB_COORDINATION_PREFIX}:${coordinationKey}`;
  const fallbackActiveTab = typeof BroadcastChannel === "undefined";
  const activeTabState = {
    activeTabIdRef,
    tabIdRef,
    isActiveTabRef,
  } satisfies ActiveTabState;

  useEffect(() => {
    if (fallbackActiveTab) {
      return;
    }

    const coordinationChannel = new BroadcastChannel(coordinationChannelName);
    coordinationChannelRef.current = coordinationChannel;

    const handleMessage = (event: MessageEvent<ActiveTabMessage>) => {
      const message = event.data;
      if (!message || message.tabId === tabIdRef.current) {
        return;
      }

      if (message.type === "claim") {
        activeTabIdRef.current = message.tabId;
        isActiveTabRef.current = false;
        return;
      }

      if (message.type === "release" && activeTabIdRef.current === message.tabId) {
        activeTabIdRef.current = null;

        if (isTabForeground()) {
          window.setTimeout(() => {
            if (activeTabIdRef.current === null) {
              claimActiveTab(activeTabState, coordinationChannel);
            }
          }, 0);
        }
      }
    };

    const handleFocusChange = () => {
      attemptActiveTab(activeTabState, coordinationChannel);
    };

    coordinationChannel.addEventListener("message", handleMessage as EventListener);
    window.addEventListener("focus", handleFocusChange);
    window.addEventListener("blur", handleFocusChange);
    window.addEventListener("pagehide", handleFocusChange);
    document.addEventListener("visibilitychange", handleFocusChange);

    attemptActiveTab(activeTabState, coordinationChannel);

    return () => {
      coordinationChannel.removeEventListener("message", handleMessage as EventListener);
      window.removeEventListener("focus", handleFocusChange);
      window.removeEventListener("blur", handleFocusChange);
      window.removeEventListener("pagehide", handleFocusChange);
      document.removeEventListener("visibilitychange", handleFocusChange);
      releaseActiveTab(activeTabState, coordinationChannel);
      coordinationChannel.close();
      coordinationChannelRef.current = null;
    };
  }, [coordinationChannelName, fallbackActiveTab, activeTabState]);

  const getIsActiveTab = () => {
    if (fallbackActiveTab) {
      return true;
    }
    return isActiveTabRef.current;
  };

  return { getIsActiveTab };
};
