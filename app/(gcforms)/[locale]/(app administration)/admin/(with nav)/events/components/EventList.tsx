import { useTranslation } from "@i18n/client";
import { useState, useEffect } from "react";
import { getFormEvents, getEventsForUser } from "../actions";
import { logMessage } from "@lib/logger";
import Loader from "@clientComponents/globals/Loader";

const sortedEvents = (
  events: {
    userId: string;
    event: string;
    timestamp: number;
    description: string;
    subject: string;
  }[]
) => {
  const sortedEvents = new Map<string, Array<Record<string, string | number>>>();

  events.forEach(({ event, timestamp, description, subject }) => {
    const eventDate = new Date(timestamp);
    const id = `${event}-${timestamp}`;
    const eventDay = eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const eventTime = eventDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (sortedEvents.get(eventDay) === undefined) {
      sortedEvents.set(eventDay, []);
    }
    sortedEvents.get(eventDay)?.push({
      id,
      event,
      timestamp,
      description,
      subject,
      eventTime,
    });
  });

  return sortedEvents;
};

export const EventList = ({ userId, formId }: { userId?: string; formId?: string }) => {
  const [events, setEvents] = useState<Map<string, Array<Record<string, string | number>>>>(
    new Map()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  logMessage.info(`userId: ${userId}`);
  logMessage.info(`formId: ${formId}`);

  // Derive the "empty" state directly instead of setting it in an effect
  const hasNoIds = !formId && !userId;

  useEffect(() => {
    // Skip the effect entirely if we have no IDs
    if (hasNoIds) {
      return;
    }

    // Prevent race conditions with cleanup
    let isCancelled = false;

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedEvents = formId
          ? await getFormEvents(formId)
          : await getEventsForUser(userId!);

        if (!isCancelled) {
          setEvents(sortedEvents(fetchedEvents));
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch events"));
          setIsLoading(false);
        }
      }
    };

    fetchEvents();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [formId, userId, hasNoIds]);

  // Clear events when we have no IDs (render-based, not effect-based)
  const displayEvents = hasNoIds ? new Map() : events;

  const { t } = useTranslation(["admin-events", "admin-users"]);

  return (
    <>
      {isLoading ? (
        <div className="flex size-full items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="mb-4">
          <p className="text-red-700">
            {t("errorLoadingEvents", { defaultValue: "Error loading events" })}
          </p>
        </div>
      ) : displayEvents.size === 0 ? (
        <div className="mb-4">
          <p>{t("noEvents")}</p>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {Array.from(displayEvents.entries()).map(([eventDay, eventItems]) => {
            return (
              <li key={eventDay} className="mb-4">
                <h2 className="mb-2">{eventDay}</h2>
                <table className="table-fixed">
                  <thead>
                    <tr>
                      <th className="text-left">{t("event")}</th>
                      <th className="px-4 text-left">{t("subject")}</th>
                      <th className="text-left">{t("description")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventItems.map(
                      ({
                        id,
                        event,
                        eventTime,
                        description,
                        subject,
                      }: Record<string, string | number>) => {
                        return (
                          <tr className="border-b-1" key={id}>
                            <td className="min-w-80 text-slate-600">
                              {eventTime} - {event}
                            </td>
                            <td className="px-4 text-slate-500">{subject}</td>
                            <td className="break-words text-slate-500">{description ?? ""}</td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};
