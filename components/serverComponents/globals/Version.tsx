import packageJson from "../../../package.json";
import { cn } from "@lib/utils";

export const Version = ({ label, isFormBuilder }: { label: string; isFormBuilder: boolean }) => {
  const { version } = packageJson;

  return (
    <div
      className={cn(
        isFormBuilder && "mt-2 text-sm text-slate-800",
        !isFormBuilder && "mr-6 inline-block text-sm text-slate-800"
      )}
    >
      {label}: {version}
    </div>
  );
};
