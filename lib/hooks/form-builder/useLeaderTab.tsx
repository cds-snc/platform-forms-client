"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

const LEADER_TAB_COORDINATION_PREFIX = "leader-tab";

type LeaderTabMessage = {
  type: "claim" | "release";
  tabId: string;
};

type LeaderTabState = {
  leaderTabIdRef: RefObject<string | null>;
  tabIdRef: RefObject<string>;
  setIsLeaderTab: Dispatch<SetStateAction<boolean>>;
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

const broadcastTabMessage = (coordinationChannel: BroadcastChannel, message: LeaderTabMessage) => {
  coordinationChannel.postMessage(message);
};

const claimLeadership = (
  { leaderTabIdRef, tabIdRef, setIsLeaderTab }: LeaderTabState,
  coordinationChannel: BroadcastChannel
) => {
  leaderTabIdRef.current = tabIdRef.current;
  setIsLeaderTab(true);
  broadcastTabMessage(coordinationChannel, { type: "claim", tabId: tabIdRef.current });
};

const releaseLeadership = (
  { leaderTabIdRef, tabIdRef, setIsLeaderTab }: LeaderTabState,
  coordinationChannel: BroadcastChannel,
  broadcast = true
) => {
  const isCurrentLeader = leaderTabIdRef.current === tabIdRef.current;

  if (broadcast && isCurrentLeader) {
    broadcastTabMessage(coordinationChannel, { type: "release", tabId: tabIdRef.current });
  }

  if (isCurrentLeader) {
    leaderTabIdRef.current = null;
  }

  setIsLeaderTab(false);
};

const attemptLeadership = (state: LeaderTabState, coordinationChannel: BroadcastChannel) => {
  if (isTabForeground()) {
    claimLeadership(state, coordinationChannel);
    return;
  }

  releaseLeadership(state, coordinationChannel);
};

export const useLeaderTab = ({
  enabled,
  coordinationKey,
}: {
  enabled: boolean;
  coordinationKey: string;
}) => {
  "use memo";
  const coordinationChannelRef = useRef<BroadcastChannel | null>(null);
  const leaderTabIdRef = useRef<string | null>(null);
  const tabIdRef = useRef<string>(getTabId());
  const [isLeaderTab, setIsLeaderTab] = useState(() => isTabForeground());
  const coordinationChannelName = `${LEADER_TAB_COORDINATION_PREFIX}:${coordinationKey}`;
  const fallbackLeaderTab = !enabled || typeof BroadcastChannel === "undefined";
  const leaderTabState = {
    leaderTabIdRef,
    tabIdRef,
    setIsLeaderTab,
  } satisfies LeaderTabState;

  useEffect(() => {
    if (fallbackLeaderTab) {
      return;
    }

    const coordinationChannel = new BroadcastChannel(coordinationChannelName);
    coordinationChannelRef.current = coordinationChannel;

    const handleMessage = (event: MessageEvent<LeaderTabMessage>) => {
      const message = event.data;
      if (!message || message.tabId === tabIdRef.current) {
        return;
      }

      if (message.type === "claim") {
        leaderTabIdRef.current = message.tabId;
        setIsLeaderTab(false);
        return;
      }

      if (message.type === "release" && leaderTabIdRef.current === message.tabId) {
        leaderTabIdRef.current = null;

        if (isTabForeground()) {
          window.setTimeout(() => {
            if (leaderTabIdRef.current === null) {
              claimLeadership(leaderTabState, coordinationChannel);
            }
          }, 0);
        }
      }
    };

    const handleFocusChange = () => {
      attemptLeadership(leaderTabState, coordinationChannel);
    };

    coordinationChannel.addEventListener("message", handleMessage as EventListener);
    window.addEventListener("focus", handleFocusChange);
    window.addEventListener("blur", handleFocusChange);
    window.addEventListener("pagehide", handleFocusChange);
    document.addEventListener("visibilitychange", handleFocusChange);

    attemptLeadership(leaderTabState, coordinationChannel);

    return () => {
      coordinationChannel.removeEventListener("message", handleMessage as EventListener);
      window.removeEventListener("focus", handleFocusChange);
      window.removeEventListener("blur", handleFocusChange);
      window.removeEventListener("pagehide", handleFocusChange);
      document.removeEventListener("visibilitychange", handleFocusChange);
      releaseLeadership(leaderTabState, coordinationChannel);
      coordinationChannel.close();
      coordinationChannelRef.current = null;
    };
  }, [coordinationChannelName, fallbackLeaderTab, leaderTabState]);

  return { isLeaderTab: fallbackLeaderTab ? true : isLeaderTab };
};
