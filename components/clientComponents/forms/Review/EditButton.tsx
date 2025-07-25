import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";

export const EditButton = ({
  reviewItemId,
  theme,
  children,
  onClick,
}: {
  reviewItemId: string;
  theme: Theme;
  children: React.ReactElement | string;
  onClick?: () => void;
}): React.ReactElement => {
  const { setGroup, clearHistoryAfterId } = useGCFormsContext();
  return (
    <Button
      theme={theme}
      className="text-left leading-10"
      onClick={() => {
        setGroup(reviewItemId);
        clearHistoryAfterId(reviewItemId);
        // Focus groups heading on navigation
        onClick && onClick();
      }}
      dataTestId={`editButton-${reviewItemId}`}
    >
      {children}
    </Button>
  );
};
