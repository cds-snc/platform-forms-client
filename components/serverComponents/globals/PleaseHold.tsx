import { cn } from "@lib/utils";

export const PleaseHold = ({ className }: { className?: string }) => {
  const Wave = () => <div className="wave"></div>;

  const numberOfWaves = 10;
  const arrayOfWaves = Array.from({ length: numberOfWaves }, (_, i) => <Wave key={i} />);

  return <div className={cn(["flex items-center gap-0.5", className])}>{arrayOfWaves}</div>;
};
