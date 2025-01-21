import { RoundedButton } from "@clientComponents/globals";

export const FilterFlagged = ({ flaggedSignupsCount }: { flaggedSignupsCount: number }) => {
  return (
    <RoundedButton theme="secondary">
      <>Accounts flagged ({flaggedSignupsCount})</>
    </RoundedButton>
  );
};
