import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { ReviewItem } from "./reviewUtils";

export const EditButton = ({
  reviewItem,
  theme,
  children,
  onClick,
}: {
  reviewItem: ReviewItem;
  theme: Theme;
  children: React.ReactElement | string;
  onClick?: () => void;
}): React.ReactElement => {
  const { setGroup, clearHistoryAfterId } = useGCFormsContext();
  return (
    <Button
      type="button"
      theme={theme}
      onClick={() => {
        setGroup(reviewItem.id);
        clearHistoryAfterId(reviewItem.id);
        // Focus groups heading on navigation
        onClick && onClick();
      }}
    >
      {children}
    </Button>
  );
};
