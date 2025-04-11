import packageJson from "../../../package.json";

const deploymentId = process.env.NEXT_DEPLOYMENT_ID || "local";

export const Version = async ({ label }: { label: string }) => {
  const { version } = packageJson;

  return (
    <div className="mr-12 inline-block text-sm text-gray-700">
      {label}: {version} <span className="hidden"> - {deploymentId}</span>
    </div>
  );
};
