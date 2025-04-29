import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import { Button } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import { useCallback, useState } from "react";
import { updateNotificationsInterval } from "./actions";

// TODO: Add a type
// TODO: Review throwing errors

export const Notifications = ({
  formId,
  notifcationsInterval,
}: {
  formId: string;
  notifcationsInterval: number | undefined;
}) => {
  const [notificationValue, setNotificationValue] = useState<string>(
    notifcationsInterval ? String(notifcationsInterval) : "off"
  );

  const updateNotificationsValue = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNotificationValue(value);
  }, []);

  const saveNotificationsValue = useCallback(async () => {
    logMessage.info(`saveNotificationsValue: ${formId} ${notificationValue}`);
    const newNotificationsInterval = notificationValue === "off" ? null : Number(notificationValue);
    await updateNotificationsInterval(formId, newNotificationsInterval);
  }, [formId, notificationValue]);

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>Notifications</h2>
      <p className="mb-2 font-bold">Email notifications for repsonses</p>
      <p className="mb-8">Receive emails when there are new responses available.</p>
      <div className="">
        <div className="mb-6">
          <Radio
            id={`notifications-daily`}
            // TODO update to  1440 when done testing
            checked={notificationValue === "1"}
            name="notifications"
            value={"1"}
            label={"Daily"}
            onChange={updateNotificationsValue}
            className="mb-0"
          />
        </div>
        <div className="mb-6">
          <Radio
            id={`notifications-weekly`}
            checked={notificationValue === "10080"}
            name="notifications"
            value={"10080"}
            label={"Weekly"}
            onChange={updateNotificationsValue}
            className="mb-0"
          />
        </div>
        <div className="mb-8">
          <Radio
            id={`notifications-off`}
            checked={notificationValue === "off"}
            name="notifications"
            value={"off"}
            label={"None"}
            onChange={updateNotificationsValue}
            className="mb-0"
          />
        </div>
      </div>
      <Button
        dataTestId="save-ownership"
        theme="secondary"
        type="submit"
        onClick={() => saveNotificationsValue()}
      >
        Save
      </Button>
    </div>
  );
};
