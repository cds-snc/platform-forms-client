"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useState } from "react";
import { AppUser } from "@lib/types/user-types";
import { setUserFlags } from "../../actions";
import { useSession } from "next-auth/react";
import { UserFeatureFlags, UserFeatureFlagKeys } from "@lib/cache/types";

export const AddUserFeatureModal = ({
  formUser,
  flags,
  userFlags,
}: {
  formUser: AppUser;
  flags: string[];
  userFlags: string[] | null;
}) => {
  const { t } = useTranslation("admin-flags");
  const [showModal, setShowModal] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const { update: updateSession } = useSession();

  // Filter the list of flags to only include user level feature flags
  const availableFeatureFlags = flags.filter((flag) =>
    Object.values(UserFeatureFlags).includes(flag as UserFeatureFlagKeys)
  );

  const handleCheckboxChange = (flag: string) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleAdd = async () => {
    await setUserFlags(formUser.id, selectedFlags);
    setShowModal(false);
    setSelectedFlags([]);
    await updateSession();
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFlags([]);
  };

  return (
    <div>
      <Button
        type="button"
        theme="primary"
        className="mt-4"
        onClick={() => {
          setShowModal(true);
          setSelectedFlags(availableFeatureFlags.filter((flag) => userFlags?.includes(flag)));
        }}
      >
        {t("addFlag")}
      </Button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="min-w-[300px] rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">{t("select-features")}</h2>
            <form>
              <div className="mb-6 flex flex-col gap-2">
                {availableFeatureFlags.map((flag) => (
                  <label key={flag} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleCheckboxChange(flag)}
                      disabled={userFlags?.includes(flag) || false}
                    />
                    {t(`features.${flag}.title`)}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" theme="secondary" onClick={handleCancel}>
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  theme="primary"
                  onClick={handleAdd}
                  disabled={selectedFlags.length === 0}
                >
                  {t("add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
