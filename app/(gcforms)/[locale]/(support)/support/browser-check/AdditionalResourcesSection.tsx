import { serverTranslation } from "@i18n";
import { DownloadIcon, UploadIcon } from "@serverComponents/icons";

export const AdditionalResourcesSection = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation("browser-check", { lang: locale });

  const itResources = [
    {
      title: t("fileSystemReadAskForUrls"),
      url: "https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/filesystemreadaskforurls",
      description: t("fileSystemReadAskForUrlsDescription"),
      icon: <DownloadIcon className="size-8 fill-slate-500" />,
    },
    {
      title: t("fileSystemWriteAskForUrls"),
      url: "https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/filesystemwriteaskforurls",
      description: t("fileSystemWriteAskForUrlsDescription"),
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
      <h3 className="!mt-0 mb-4 text-lg font-bold">{t("itAdministrators", "IT Administrators")}</h3>
      <div className="mb-8 divide-y divide-slate-200">
        {itResources.map((resource) => (
          <div key={resource.title} className="grid grid-cols-[60px_1fr] gap-4 py-3 first:pt-0">
            <div className="mt-1 flex items-start justify-center">{resource.icon}</div>
            <div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 block text-sm 
                font-medium
                !text-slate-500 no-underline
                
                hover:underline"
              >
                {resource.title}
              </a>
              <p className="text-sm font-bold ">{resource.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-4 text-base font-bold">
        {t("additionalResources", "Additional Resources")}
      </h3>
      <div className="divide-y divide-slate-200">
        {resources.map((resource) => (
          <div key={resource.title} className="py-3 first:pt-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 block 
              text-sm
              font-bold !text-current no-underline
              hover:underline"
            >
              {resource.title}
            </a>
            <p className="text-sm !text-slate-600">{resource.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
