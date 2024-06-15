import { createContext, useContext, useState } from "react";

// Remember to add the Provider near the root of the app, currently in ClientContexts may want to move lower down

// TODO Move LikeMessage to a near root CLIENT component - currently testing in Start.tsx

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LiveMessageContext = createContext({ message: "", setMessage: (message: string) => {} });

export const LiveMessagePovider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string>("");

  return (
    <LiveMessageContext.Provider value={{ message, setMessage }}>
      {children}
    </LiveMessageContext.Provider>
  );
};

// TODO add message level
// TODO add class sr-only
// TODO add a slight delay?
// TODO think about queueing messages..
export const LiveMessage = () => {
  const { message } = useContext(LiveMessageContext);
  return (
    <div aria-live="polite">
      <h1>TestLiveMessage={message}</h1>
    </div>
  );
};

export const useLiveMessage = () => {
  const { message, setMessage: sendMessage } = useContext(LiveMessageContext);
  return [message, sendMessage];
};
