import { serverTranslation } from "@i18n";
import { getUsers } from "@lib/users";
import { Card } from "@serverComponents/globals/card/Card";
import { UserCard } from "./components/UserCard";
import { FilterAll } from "./components/FilterAll";
import { FilterFlagged } from "./components/FilterFlagged";
import { ConfirmDeactivateDialog } from "./components/ConfirmDeactivateDialog";
import { AddNoteDialog } from "./components/AddNoteDialog";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";

export default AuthenticatedPage(
  [authorization.canViewAllUsers, authorization.canManageAllUsers],
  async ({ searchParams }) => {
    let { filter } = await searchParams;
    filter = filter && filter === "flagged" ? "flagged" : "all";

    const { t } = await serverTranslation(["admin-recent-signups"]);

    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentSignups = await getUsers({
      createdAt: {
        gte: from,
      },
      active: true,
    });

    const flaggedSignups = await getUsers({
      active: true,
      createdAt: {
        gte: from,
      },
      OR: [
        {
          email: {
            startsWith: "%-%@",
            not: {
              startsWith: "%.%@",
            },
          },
        },
        {
          AND: [
            {
              email: {
                not: {
                  startsWith: "%-%@",
                },
              },
            },
            {
              email: {
                not: {
                  startsWith: "%.%@",
                },
              },
            },
          ],
        },
      ],
    });

    let filteredSignups = recentSignups;

    if (filter === "flagged") {
      filteredSignups = flaggedSignups;
    }

    return (
      <>
        <h1>{t("recentAccounts")}</h1>
        <p>
          {t("accountsCreatedFromTo", {
            from: from.toLocaleDateString("en-GB"),
            to: new Date().toLocaleDateString("en-GB"),
            interpolation: { escapeValue: false },
          })}
        </p>

        <div className="my-4 flex gap-4">
          <FilterAll recentSignupsCount={recentSignups.length} active={filter === "all"} />
          <FilterFlagged
            flaggedSignupsCount={flaggedSignups.length}
            active={filter === "flagged"}
          />
        </div>

        <div className="mb-10" aria-live="polite">
          {filteredSignups?.length > 0 ? (
            <ul
              data-testid="accountsList"
              className="m-0 flex list-none flex-row flex-wrap gap-4 p-0"
            >
              {filteredSignups?.map((user) => {
                return (
                  <div
                    className="w-1/3 overflow-x-hidden rounded-md border-2 border-black p-2"
                    id={`user-${user.id}`}
                    key={user.id}
                    data-testid={user.email}
                  >
                    <UserCard
                      user={user}
                      flagged={flaggedSignups.some((flaggedUser) => flaggedUser.id === user.id)}
                    />
                  </div>
                );
              })}
            </ul>
          ) : (
            <Card>
              <p className="text-[#748094]">No flagged users found</p>
            </Card>
          )}
        </div>
        <ConfirmDeactivateDialog />
        <AddNoteDialog />
      </>
    );
  }
);
