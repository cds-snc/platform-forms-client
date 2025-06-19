import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { getUser } from "@lib/users";
import { UserFeaturesList } from "./components/server/UserFeaturesList";
import { AddUserFeatureModal } from "./components/client/AddUserFeatureModal";
import { checkAll } from "@lib/cache/flags";

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers, authorization.canAccessFlags],
  async ({ params }) => {
    const { id } = await params;

    const formUser = await getUser(id);

    const flags = await checkAll();

    return (
      <div>
        <h1>Manage User Features</h1>
        <p>
          User: {formUser?.name} ({formUser?.email})
        </p>

        <UserFeaturesList formUser={formUser} />

        <AddUserFeatureModal formUser={formUser} flags={Object.keys(flags)} />
      </div>
    );
  }
);
