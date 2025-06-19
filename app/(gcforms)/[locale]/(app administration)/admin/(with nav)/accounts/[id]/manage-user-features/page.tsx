import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { getUser } from "@lib/users";
import { UserFeaturesList } from "./components/server/UserFeaturesList";

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers, authorization.canAccessFlags],
  async ({ params }) => {
    const { id } = await params;

    const formUser = await getUser(id);

    return (
      <div>
        <h1>Manage User Features</h1>
        <p>
          User: {formUser?.name} ({formUser?.email})
        </p>

        <UserFeaturesList formUser={formUser} />
      </div>
    );
  }
);
