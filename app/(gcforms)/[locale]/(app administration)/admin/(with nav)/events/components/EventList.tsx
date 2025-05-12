import { useTranslation } from "@i18n/client";
import { useState, useEffect } from "react";
import { getEventsForForm, getEventsForUser } from "../actions";
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

  logMessage.info(`userId: ${userId}`);
  logMessage.info(`formId: ${formId}`);

  useEffect(() => {
    if (formId) {
      setIsLoading(true);
      getEventsForForm(formId).then((events) => {
        setEvents(sortedEvents(events));
        setIsLoading(false);
      });
    }
  }, [formId]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      getEventsForUser(userId).then((events) => {
        setEvents(sortedEvents(events));
        setIsLoading(false);
      });
    }
  }, [userId]);

  const { t } = useTranslation(["admin-events", "admin-users"]);

  return (
    <>
      {isLoading ? (
        <div className="flex size-full items-center justify-center">
          <Loader />
        </div>
      ) : events.size === 0 ? (
        <div className="mb-4">
          <p>{t("noEvents")}</p>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {Array.from(events.entries()).map(([eventDay, eventItems]) => {
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
                    {eventItems.map(({ id, event, eventTime, description, subject }) => {
                      return (
                        <tr className="border-b-1 " key={id}>
                          <td className="min-w-80 text-slate-600">
                            {eventTime} - {event}
                          </td>
                          <td className="px-4 text-slate-500">{subject}</td>
                          <td className="break-words text-slate-500 ">{description ?? ""}</td>
                        </tr>
                      );
                    })}
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
