"use client";

import { GcdsNotice } from "@gcds-core/components-react";
import { NoticeType } from "@gcforms/types";

export const Notice = ({
  title,
  type,
  children,
}: {
  title: string;
  type: NoticeType;
  children?: React.ReactNode;
}) => (
  <GcdsNotice noticeRole={type} noticeTitle={title} noticeTitleTag="h2">
    {children}
  </GcdsNotice>
);
