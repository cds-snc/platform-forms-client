import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { getUser } from "@lib/users";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";
import { Metadata } from "next";
import { getEventsForUser } from "@lib/auditLogs";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-events", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers],
  async ({ params }) => {
    const { id, locale } = await params;

    const formUser = await getUser(id);

    const { t } = await serverTranslation(["admin-events", "admin-users"], { lang: locale });
    const events = (await getEventsForUser(id)) ?? [];

    const sortedEvents: { [key: string]: Array<Record<string, string | number>> } = {};
    events.forEach(({ event, timestamp, description }) => {
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

      if (sortedEvents[eventDay] === undefined) {
        sortedEvents[eventDay] = [];
      }
      sortedEvents[eventDay].push({
        id,
        event,
        timestamp,
        description,
        eventTime,
      });
    });

    return (
      <>
        <div>
          <BackLink href={`/${locale}/admin/accounts?id=${formUser.id}`}>
            {t("backToAccounts", { ns: "admin-users" })}
          </BackLink>
          <h1 className="mb-10 border-0">
            {formUser && <span className="block text-base">{formUser?.name}</span>}
            {formUser && <span className="block text-base font-normal">{formUser?.email}</span>}
            {t("title")}
          </h1>
        </div>

        {events.length === 0 ? (
          <div className="mb-4">
            <p>{t("noEvents")}</p>
          </div>
        ) : null}

        <ul className="m-0 list-none p-0">
          {Object.entries(sortedEvents).map(([eventDay, events]) => {
            return (
              <li key={eventDay} className="mb-4">
                <h2 className="mb-2">{eventDay}</h2>
                {events.map(({ id, event, eventTime, description }) => {
                  return (
                    <div
                      className="flex border-b-1 py-2" // Added `break-words` for wrapping
                      key={id}
                    >
                      <div className="w-80 text-slate-600">
                        <span> {eventTime}</span> - <span>{event}</span>
                      </div>
                      <div>
                        {description ? (
                          <span className="inline-block max-w-[600px] break-words text-slate-500 ">
                            {description}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </>
    );
  }
);
