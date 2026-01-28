"use client";
interface StatusBadgeProps {
  isSuccess: boolean;
  title: string;
  message: string;
  className?: string;
}

export const StatusBadge = ({ isSuccess, title, className = "" }: StatusBadgeProps) => {
  const config = isSuccess
    ? {
        className: "border border-green-200 bg-green-50",
        badgeClass: "text-emerald-700",
        iconClass: "gcds-icon-checkmark-circle",
      }
    : {
        className: "border border-red-200 bg-red-50",
        badgeClass: "text-red-600",
        iconClass: "gcds-icon-warning-triangle",
      };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-2xl px-4 py-2 ${config.className} mb-6 ${className}`}
    >
      <div
        className={`flex items-center justify-center ${isSuccess ? "border-emerald-700" : "border-red-600"}`}
      >
        <span className={`gcds-icon ${config.iconClass} inline-block ${config.badgeClass}`}></span>
      </div>
      <p className={`text-lg font-semibold ${config.badgeClass}`}>{title}</p>
    </div>
  );
};
