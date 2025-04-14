import packageJson from "../../../package.json";
import { cn } from "@lib/utils";

const deploymentId = process.env.NEXT_DEPLOYMENT_ID || "local";

export const Version = ({ label, isFormBuilder }: { label: string; isFormBuilder: boolean }) => {
  const { version } = packageJson;

  return (
    <div
      className={cn(
        isFormBuilder && "mt-2 text-sm text-slate-800",
        !isFormBuilder && " text-sm text-slate-800 inline-block mr-10"
      )}
    >
      {label}: {version} <span className="hidden"> - {deploymentId}</span>
    </div>
  );
};
