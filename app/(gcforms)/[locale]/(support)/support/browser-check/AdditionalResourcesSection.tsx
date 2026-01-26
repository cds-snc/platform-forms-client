import { serverTranslation } from "@i18n";
import { DownloadIcon, UploadIcon } from "@serverComponents/icons";

export const AdditionalResourcesSection = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation("browser-check", { lang: locale });

  const itResources = [
    {
      title: t("microsoftEdgeDownload"),
      url: "https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/filesystemreadaskforurls",
      description: t("fileSystemRead"),
      icon: <DownloadIcon className="size-8 fill-slate-500" />,
    },
    {
      title: t("microsoftEdgeUpload"),
      url: "https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/filesystemwriteaskforurls",
      description: t("fileSystemWrite"),
      icon: <UploadIcon className="size-8 fill-slate-500" />,
    },
  ];

  const resources = [
    {
      title: t("mdnWebDocs"),
      url: "https://developer.mozilla.org/en-US/docs/Web/API/File_System_API",
      description: t("mdnWebDocsDescription"),
    },
    {
      title: t("webDevGuide"),
      url: "https://web.dev/file-system-access/",
      description: t("webDevGuideDescription"),
    },
  ];

  return (
    <div>
      <h5 className="!mt-0 mb-4 text-lg font-bold text-slate-950">{t("itAdministrators")}</h5>
      <div className="mb-8 divide-y divide-slate-200">
        {itResources.map((resource) => (
          <div key={resource.title} className="grid grid-cols-[60px_1fr] gap-4 py-3 first:pt-0">
            <div className="mt-1 flex items-start justify-center">{resource.icon}</div>
            <div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 block text-base 
                font-bold
                !text-slate-500 no-underline
                
                hover:underline"
              >
                {resource.title}
              </a>
              <p className="text-lg font-bold text-slate-950 ">{resource.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h5 className="mb-4 text-lg font-bold text-slate-950">{t("additionalResources")}</h5>
      <div className="divide-y divide-[#D1D5DB]">
        {resources.map((resource) => (
          <div key={resource.title} className="py-3 first:pt-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 block 
              text-lg
              font-bold !text-current no-underline
              hover:underline"
            >
              {resource.title}
            </a>
            <p className="text-lg !text-slate-800">{resource.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
