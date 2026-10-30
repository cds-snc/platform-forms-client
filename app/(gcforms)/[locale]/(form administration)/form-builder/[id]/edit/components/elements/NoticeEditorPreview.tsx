"use client";

import { GcdsIcon } from "@gcds-core/components-react";
import { NoticeType } from "@lib/types";
import type { ReactNode } from "react";

const noticeIcons = {
  [NoticeType.DANGER]: "exclamation-circle",
  [NoticeType.INFO]: "info-circle",
  [NoticeType.SUCCESS]: "checkmark-circle",
  [NoticeType.WARNING]: "warning-triangle",
} as const;

const noticeColors: Record<NoticeType, string> = {
  [NoticeType.DANGER]: "var(--gcds-notice-danger-text)",
  [NoticeType.INFO]: "var(--gcds-notice-info-text)",
  [NoticeType.SUCCESS]: "var(--gcds-notice-success-text)",
  [NoticeType.WARNING]: "var(--gcds-notice-warning-text)",
};

export const NoticeEditorPreview = ({
  type,
  titleEditor,
  children,
}: {
  type: NoticeType;
  titleEditor: ReactNode;
  children: ReactNode;
}) => (
  <div
    className="grid"
    style={{
      color: "var(--gcds-notice-text)",
      columnGap: "var(--gcds-notice-icon-gap)",
      gridTemplateColumns: "var(--gcds-notice-icon-width) minmax(0, 1fr)",
    }}
  >
    <div
      aria-hidden="true"
      className="flex h-full flex-col items-center"
      style={{ color: noticeColors[type] }}
    >
      <div
        style={{
          backgroundColor: "currentColor",
          height: "var(--gcds-notice-icon-before-height)",
          width: "var(--gcds-notice-border-width)",
        }}
      />
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center">
        <GcdsIcon name={noticeIcons[type]} size="h4" />
      </div>
      <div
        className="flex-1"
        style={{
          backgroundColor: "currentColor",
          width: "var(--gcds-notice-border-width)",
        }}
      />
    </div>
    <div className="min-w-0">
      <div className="mt-4 mb-2">{titleEditor}</div>
      {children}
    </div>
  </div>
);
