import { useTranslation } from "react-i18next";
export const ConfirmationTitle = () => {
  const { t } = useTranslation("confirmation");
  return (
    <div className="mb-8 text-[1rem]">
      <div
        className="mb-10 h-[1px]"
        style={{
          backgroundImage: "linear-gradient(to right, #1E293B 50%, transparent 50%)",
          backgroundSize: "16px 1px",
          backgroundRepeat: "repeat-x",
        }}
      ></div>
      <div className="mb-2 inline-block rounded-md border-1 border-slate-500 bg-slate-50 px-2 py-1 text-slate-500">
        {t("sectionTitle")}
      </div>
      <h2 className="mt-0 text-2xl text-slate-500 laptop:mt-0">{t("title")}</h2>
    </div>
  );
};
