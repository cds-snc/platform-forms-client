import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";

export const EditButton = ({
  reviewItemId,
  theme,
  children,
  onClick,
  description,
}: {
  reviewItemId: string;
  theme: Theme;
  children: React.ReactElement | string;
  onClick?: () => void;
  description?: string;
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
      // Helpful when the same button is on the screen more than once
      {...(description && { "aria-description": description })}
      dataTestId={`editButton-${reviewItemId}`}
    >
      {children}
    </Button>
  );
};
