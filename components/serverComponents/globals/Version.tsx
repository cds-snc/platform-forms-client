import packageJson from "../../../package.json";

export const Version = async ({
  label,
  deploymentId,
}: {
  label: string;
  deploymentId?: string;
}) => {
  const { version } = packageJson;

  return (
    <div className="mr-12 inline-block text-sm text-gray-700">
      {label}: {version} <span className="hidden"> - {deploymentId}</span>
    </div>
  );
};
