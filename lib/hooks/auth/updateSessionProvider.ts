let broadcastChannel: BroadcastChannel | null = null;

function broadcast() {
  if (typeof BroadcastChannel === "undefined") {
    return {
      postMessage: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }

  if (broadcastChannel === null) {
    broadcastChannel = new BroadcastChannel("next-auth");
  }

  return broadcastChannel;
}

export const updateSessionProvider = () => {
  broadcast().postMessage({
    event: "session",
    data: { trigger: "getSession" },
  });
};
