import { RoundedButton } from "@clientComponents/globals";

export const FilterAll = ({ recentSignupsCount }: { recentSignupsCount: number }) => {
  return (
    <RoundedButton>
      <>All ({recentSignupsCount})</>
    </RoundedButton>
  );
};
