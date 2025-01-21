import { createContext, useContext, useState } from "react";

// TODO:
// - think about queueing announcements to avoid overflowing an ATs buffer.

/**
 * Why would I use this?
 * When adding ARIA semantics become very complex, is simply not possible, or you would simply like
 * more control over what is announced to the AT user.
 */

export enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

export interface Message {
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

export const LiveMessage = () => {
  const { message } = useContext(LiveMessageContext);
  return (
    <div aria-live={message.priority} className="sr-only">
      {message.content}
    </div>
  );
};

/**
 * A Util to access the live region to speak (announce) a message.
 *
 * Example usage:
 *   const [speak] = useLiveMessage();
 *   ...
 *   <button onClick={() => speak("Hello World")}>Click me</button>
 */
export const useLiveMessage = () => {
  const { message, setMessage } = useContext(LiveMessageContext);
  /**
   * Updates the app-wide live-region with the passed in content to be announced by AT.
   * @param content text message to be announced
   * @param priority ARIA live region priority. Use HIGH sparingly e.g. an imporatnt error message
   * @param delayInSeconds default of 40 (next-ish tick) helps the message be announced after other
   * browser or ARIA updates complete. The delay can also be increased if desired.
   */
  function speak(
    content: string = "",
    priority: Priority = Priority.LOW,
    delayInSeconds: number = 40
  ) {
    // Handle just encase an AT or the DOM decides to treat an identical update as a new one
    if (message.content === content) return;
    setTimeout(() => setMessage({ content, priority } as Message), delayInSeconds);
  }
  return [speak];
};
