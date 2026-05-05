export const EditLockDebugMarker = ({
  testId,
  editLockEnabled,
  assignedUserCount,
}: {
  testId: string;
  editLockEnabled: boolean;
  assignedUserCount: number;
}) => {
  return (
    <div
      hidden
      aria-hidden="true"
      data-testid={testId}
      data-edit-lock-enabled={String(editLockEnabled)}
      data-assigned-user-count={String(assignedUserCount)}
    />
  );
};
