"use client";

import { useEffect, useState } from "react";
import { Button } from "@clientComponents/globals";

export const MaintenanceAvailabilityNotice = ({
  formId,
  initialAvailability,
  becameAvailableMessage,
  becameUnavailableMessage,
  reloadLabel,
  unavailableRedirectUrl,
}: {
  formId: string;
  initialAvailability: boolean;
  becameAvailableMessage: string;
  becameUnavailableMessage: string;
  reloadLabel: string;
  unavailableRedirectUrl?: string;
}) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/id/${formId}/availability`);

    const handleChanged = (event: Event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as { available: boolean };

      if (!payload.available && initialAvailability && unavailableRedirectUrl) {
        window.location.assign(unavailableRedirectUrl);
        return;
      }

      setMessage(payload.available ? becameAvailableMessage : becameUnavailableMessage);
      eventSource.close();
    };

    eventSource.addEventListener("changed", handleChanged);
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("changed", handleChanged);
      eventSource.close();
    };
  }, [
    becameAvailableMessage,
    becameUnavailableMessage,
    formId,
    initialAvailability,
    unavailableRedirectUrl,
  ]);

  if (!message) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-md border-2 border-green-700 bg-green-50 p-4"
      role="status"
      aria-live="polite"
    >
      <p className="mb-4">{message}</p>
      <Button theme="secondary" onClick={() => window.location.reload()}>
        {reloadLabel}
      </Button>
    </div>
  );
};
