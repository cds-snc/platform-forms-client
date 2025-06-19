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
        {t("Add User Feature")}
      </Button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">{t("Select Features")}</h2>
            <form>
              <div className="flex flex-col gap-2 mb-6">
                {flags.map((flag) => (
                  <label key={flag} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFlags.includes(flag)}
                      onChange={() => handleCheckboxChange(flag)}
                    />
                    {flag}
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
