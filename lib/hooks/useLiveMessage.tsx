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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LiveMessageContext = createContext({
  message: messageDefault,
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
 *
 * Important:
 * This component <LiveMessage /> should be placed near the root of your nearest Client component.
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
