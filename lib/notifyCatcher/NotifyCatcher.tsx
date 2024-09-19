"use client";
import { useEffect, useState } from "react";
import { fetchMessages, resetMessages } from "./actions";

interface Message {
  email: string;
  personalisation: {
    subject: string;
    formResponse: string;
  };
}

export const NotifyCatcher = () => {
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

  const clearMessages = async () => {
    resetMessages();
    setMessages([]);
  };

  useEffect(() => {
    getMessages();
  }, []);

  return (
    <>
      {!visible && (
        <div
          className="fixed bottom-0 right-0 mb-10 mr-10 cursor-pointer rounded-md bg-violet-700 p-2 text-white shadow-sm"
          onClick={() => open()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#FFF"
            className="mr-2 inline-block"
          >
            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
          </svg>
          Notify Intercept
        </div>
      )}
      {visible && (
        <div className="fixed bottom-0 right-0 mb-10 mr-10 h-[600px] w-2/5 overflow-x-hidden border border-slate-700 bg-white shadow-md">
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
                    return (
                      <div
                        className="my-4 rounded-md border border-violet-700 bg-violet-50 p-4"
                        key={index}
                      >
                        <div>
                          <strong>To:</strong> {message.email}
                        </div>
                        <div>
                          <strong>Subject:</strong> {message.personalisation.subject}
                        </div>
                        <div>
                          <strong>Body:</strong>
                          <div className="whitespace-pre-line">
                            {" "}
                            {message.personalisation.formResponse}
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
