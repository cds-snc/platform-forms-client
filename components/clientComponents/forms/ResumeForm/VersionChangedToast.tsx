import { useTranslation } from "@i18n/client";
import { InfoIcon } from "@serverComponents/icons";

export const VersionChangedToast = ({ language }: { language: "en" | "fr" }) => {
  const { t } = useTranslation("common");

  const title = language === "fr" ? "Formulaire mis à jour" : "Form updated";
  const message =
    language === "fr"
      ? "Le formulaire a été mis à jour depuis votre dernière visite. Vérifiez vos réponses avant d'envoyer."
      : "The form was updated since your last visit. Please review your answers before submitting.";

  return (
    <div className="w-full px-4 py-2 text-black">
      <div className="flex items-start gap-6">
        <div className="flex shrink-0 flex-col items-center self-stretch">
          <div className="h-8 w-1.5 bg-[#0b69ff]" />
          <InfoIcon className="my-3 size-8 fill-[#0b69ff]" />
          <div className="min-h-12 w-1.5 flex-1 bg-[#0b69ff]" />
        </div>
        <div>
          <h3 className="mt-0! mb-2! pb-0 text-2xl leading-tight font-semibold text-black">{title}</h3>
          <p className="mb-0 text-xl leading-relaxed text-black">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default VersionChangedToast;
