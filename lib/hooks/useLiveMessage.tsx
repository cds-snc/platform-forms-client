import { createContext, useContext, useState } from "react";

// TODO:
// - think about queueing announcement to avoid overflowing an ATs buffer.

enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

interface Message {
  content: string;
  priority: Priority;
}

const messageDefault = { content: "", priority: Priority.LOW };

const LiveMessageContext = createContext({
  message: messageDefault,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMessage: (message: Message) => {},
});

export const LiveMessagePovider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<Message>(messageDefault);
  return (
    <LiveMessageContext.Provider value={{ message, setMessage }}>
      {children}
    </LiveMessageContext.Provider>
  );
};

/**
 * A component that will announce a message to screen readers (and other assistive technologies).
 * Currently <LiveMessage /> lives as a global component in Header.tsx. It should remain a
 * singleton to avoid multiple announcements for the same message.
 *
 * For more info on aria-live defaults and e.g. polite vs assertive, see:
 * https://www.w3.org/TR/wai-aria/#aria-live
 */
export const LiveMessage = () => {
  const { message } = useContext(LiveMessageContext);
  return (
    <div aria-live={message.priority} className="sr-only">
      {message.content}
    </div>
  );
};

/**
 * A Util to access the live region to announce a message.
 *
 * Example usage:
 *   const [announce] = useLiveMessage();
 *   ...
 *   <button onClick={() => announce("Hello World", Priority.LOW)}>Click me</button>
 */
export const useLiveMessage = () => {
  const { message, setMessage } = useContext(LiveMessageContext);
  function announce(content: string = "", priority: Priority = Priority.LOW) {
    if (message.content === content) return;
    setMessage({ content, priority } as Message);
  }
  return [announce];
};
