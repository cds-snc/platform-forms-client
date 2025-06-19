"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useState } from "react";
import { AppUser } from "@lib/types/user-types";
import { setUserFlags } from "../../actions";

export const AddUserFeatureModal = ({
  formUser,
  flags,
}: {
  formUser: AppUser;
  flags: string[];
}) => {
  const { t } = useTranslation("admin-flags");
  const [showModal, setShowModal] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  const handleCheckboxChange = (flag: string) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleAdd = () => {
    setUserFlags(formUser.id, selectedFlags);
    setShowModal(false);
    setSelectedFlags([]);
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFlags([]);
  };

  return (
    <div>
      <Button type="button" theme="primary" className="mt-4" onClick={() => setShowModal(true)}>
        {t("addFlag")}
      </Button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="min-w-[300px] rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">{t("Select Features")}</h2>
            <form>
              <div className="mb-6 flex flex-col gap-2">
                {flags.map((flag) => (
                  <label key={flag} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleCheckboxChange(flag)}
                    />
                    {t(`features.${flag}.title`)}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" theme="secondary" onClick={handleCancel}>
                  {t("Cancel")}
                </Button>
                <Button
                  type="button"
                  theme="primary"
                  onClick={handleAdd}
                  disabled={selectedFlags.length === 0}
                >
                  {t("Add")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
