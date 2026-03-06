"use client";
import { useEffect, useRef, useState } from "react";
import { fetchMessages, resetMessages, deleteMessageByIndex } from "./actions";
import Markdown from "markdown-to-jsx";

interface Message {
  email: string;
  personalisation: {
    subject: string;
    formResponse: string;
  };
}

export const NotifyCatcher = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const getMessages = async () => {
    setLoading(true);
    const messages = await fetchMessages();
    setMessages(messages);
    setLoading(false);
  };

  const open = () => {
    getMessages();
    setVisible(true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setVisible(false);
    }
  };

  const clearMessages = async () => {
    resetMessages();
    setMessages([]);
  };

  const deleteMessage = async (index: number) => {
    await deleteMessageByIndex(index);
    setMessages(messages.filter((_, i) => i !== index));
  };

  const is2FAMessage = (message: Message): boolean => {
    return (
      message.personalisation.subject.includes("Your security code") ||
      message.personalisation.subject.includes("Votre code de sécurité")
    );
  };

  const extract2FACode = (message: Message): string | null => {
    if (!is2FAMessage(message)) return null;
    // Extract the code - it's typically a short alphanumeric string
    const lines = message.personalisation.formResponse.split("\n").filter((line) => line.trim());
    // The code is usually the last non-empty line or a short alphanumeric string
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for a short code (typically 4-6 characters, alphanumeric)
      if (trimmed.length >= 4 && trimmed.length <= 8 && /^[A-Za-z0-9]+$/.test(trimmed)) {
        return trimmed;
      }
    }
    return null;
  };

  const copyCodeToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      // Ignore clipboard errors
    }
  };

  useEffect(() => {
    getMessages();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {!visible && (
        <div
          className="fixed bottom-0 right-0 mb-4 mr-4 flex cursor-pointer items-center gap-1.5 rounded-full bg-violet-700 px-3 py-2 text-white shadow-lg transition-transform hover:scale-105"
          onClick={() => open()}
          title={`${messages.length} intercepted message${messages.length !== 1 ? "s" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#FFF"
          >
            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
          </svg>
          <span className="text-sm font-semibold">{messages.length}</span>
        </div>
      )}
      {visible && (
        <div
          ref={ref}
          className="fixed bottom-0 right-0 mb-10 mr-10 h-[600px] w-2/5 overflow-x-hidden rounded-md border border-slate-700 bg-white shadow-md"
        >
          {loading ? (
            <div className="h-[600px] p-80">Loading...</div>
          ) : (
            <>
              <div className="flex justify-between border-b border-slate-300 px-4 pt-4 shadow-sm">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    className="mr-2 inline-block"
                  >
                    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
                  </svg>
                  <h2 className="inline-block text-lg">Notify Intercept</h2>
                  <span className="ml-2 inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-sm font-semibold text-violet-700">
                    {messages.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  {messages.length > 0 && (
                    <button onClick={() => clearMessages()}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#5f6368"
                      >
                        <path d="M600-240v-80h160v80H600Zm0-320v-80h280v80H600Zm0 160v-80h240v80H600ZM120-640H80v-80h160v-60h160v60h160v80h-40v360q0 33-23.5 56.5T440-200H200q-33 0-56.5-23.5T120-280v-360Zm80 0v360h240v-360H200Zm0 0v360-360Z" />
                      </svg>
                    </button>
                  )}
                  <button onClick={() => getMessages()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#5f6368"
                    >
                      <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
                    </svg>
                  </button>
                  <button onClick={() => setVisible(false)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#5f6368"
                    >
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-scroll px-4">
                {messages.length === 0 && (
                  <div className="my-4 rounded-md border border-violet-700 bg-violet-50 p-4">
                    No messages to show
                  </div>
                )}
                {messages &&
                  messages.map((message, index) => {
                    const securityCode = extract2FACode(message);
                    return (
                      <div
                        className="my-4 rounded-lg border border-violet-200 bg-white p-4 shadow-sm"
                        key={index}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <dl className="grid flex-1 grid-cols-[auto,1fr] gap-x-4">
                            <dt className="font-semibold text-slate-700">To:</dt>
                            <dd className="text-slate-900">{message.email}</dd>
                            <dt className="font-semibold text-slate-700">Subject:</dt>
                            <dd className="text-slate-900">{message.personalisation.subject}</dd>
                          </dl>
                          <button
                            onClick={() => deleteMessage(index)}
                            className="ml-2 rounded p-1 hover:bg-red-50"
                            title="Delete this message"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="20px"
                              viewBox="0 -960 960 960"
                              width="20px"
                              fill="#ef4444"
                            >
                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3 border-t border-slate-200 pt-3">
                          {securityCode ? (
                            <div className="mb-3 flex items-center justify-between rounded-md bg-blue-50 p-3">
                              <div>
                                <span className="text-xs font-semibold uppercase text-blue-700">
                                  Security Code
                                </span>
                                <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
                                  {securityCode}
                                </div>
                              </div>
                              <button
                                onClick={() => copyCodeToClipboard(securityCode)}
                                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                title="Copy code to clipboard"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  height="18px"
                                  viewBox="0 -960 960 960"
                                  width="18px"
                                  fill="#FFF"
                                >
                                  <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                                </svg>
                                Copy
                              </button>
                            </div>
                          ) : null}
                          <div className="whitespace-pre-line text-slate-700">
                            <Markdown options={{ forceBlock: true }}>
                              {message.personalisation.formResponse}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
