import packageJson from "../../../package.json";

const deploymentId = process.env.NEXT_DEPLOYMENT_ID || "local";

export const Version = async ({ label }: { label: string }) => {
  const { version } = packageJson;

  return (
    <div className="mt-4 text-sm text-slate-800">
      {label}: {version} <span> - {deploymentId}</span>
    </div>
  );
};
