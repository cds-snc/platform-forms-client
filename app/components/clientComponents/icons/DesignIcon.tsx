"use client";
import React from "react";
export const DesignIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M.582 20.418v-4.256l5.293-5.294L.991 5.957a1.654 1.654 0 0 1-.368-.546c-.082-.2-.123-.4-.123-.6 0-.2.04-.4.123-.6.082-.2.204-.382.368-.546l2.456-2.483c.163-.164.345-.286.546-.368.2-.082.4-.123.6-.123a1.678 1.678 0 0 1 1.173.491l4.911 4.911L16.052.718a.667.667 0 0 1 .273-.177c.091-.027.191-.041.3-.041.11 0 .21.014.3.04a.667.667 0 0 1 .273.178l3.084 3.083c.09.091.15.182.177.273.027.091.041.191.041.3 0 .11-.014.21-.04.3a.667.667 0 0 1-.178.273l-5.376 5.376 4.912 4.911c.164.164.286.35.368.56.082.209.123.413.123.613s-.04.4-.123.6c-.082.2-.204.383-.368.546l-2.456 2.429a1.653 1.653 0 0 1-.545.368c-.2.082-.4.123-.6.123-.2 0-.4-.041-.601-.123a1.653 1.653 0 0 1-.546-.368l-4.911-4.884-5.32 5.32H.581ZM7.048 9.695 9.504 7.24 7.512 5.248l-1.31 1.31L5.058 5.41l1.31-1.31L4.62 2.356 2.164 4.811l4.884 4.884Zm9.114 9.14 2.455-2.455-1.746-1.746-1.31 1.31-1.146-1.147 1.31-1.31-1.992-1.991-2.455 2.456 4.884 4.884Zm-13.943-.054h1.91L15.452 7.458l-1.91-1.91L2.22 16.87v1.91Zm14.38-12.47 1.91-1.91-1.91-1.91-1.91 1.91 1.91 1.91Z" />
  </svg>
);
