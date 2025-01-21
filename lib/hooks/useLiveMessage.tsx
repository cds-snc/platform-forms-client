import { createContext, useContext, useState } from "react";

/**
 * Why would I use this?
 *
 * The current problem this solves is announcing when a server action causes a server side update
 * e.g. updating a route. Client side ways of detecting/watching this won't really work so we need
 * to manually announced these changes for an AT user.
 *
 * Another problem is that as our app becomes more and more complex, predicting how an AT will
 * "understand" and announce the semantics we add to HTML will become more and more difficult and
 * unpredictable. Using a live region as a global singleton "channel" to announce updates gives us
 * complete control over how we tailor our UX for AT users. But only use this as a last resort
 * in complex cases.
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

  // TODO:
  // - try adding a utility to reset the live region once announced
  // - think about queueing announcements to avoid overflowing an ATs buffer.

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
   * Updates the app-wide live-region with the passed in content.
   * @param content text message to be announced
   * @param priority ARIA live region priority. Only set to HIGH (assertive) if this message is
   * time sensitive and important, like an error message
   * @param delayInSeconds by default sets announcement to run on the next tick so the message
   * has a chance to run after other actions like a focus and not be easily missed. Or set this
   * to a number in seconds to have a delay before the message is announced.
   */
  function speak(
    content: string = "",
    priority: Priority = Priority.LOW,
    delayInSeconds: number = 0
  ) {
    // DOM/AT should handle identical updates but let's handle it just encase
    if (message.content === content) return;
    setTimeout(() => setMessage({ content, priority } as Message), delayInSeconds);
  }
  return [speak];
};
