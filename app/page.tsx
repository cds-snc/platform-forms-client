import Link from "next/link";
import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GC Forms - Formulaires GC",
};

export default function Page() {
  return (
    <>
      <div>
        <h1>
          <span lang="en">GC Forms</span> - <span lang="fr">Formulaires GC</span>
        </h1>
      </div>
      <div className="m-auto grid w-2/4 max-w-2xl grid-cols-2 gap-x-4  border-gray-400 p-10">
        <p>
          <Link href="/en/form-builder" lang="en" locale={false}>
            English
          </Link>
        </p>

        <p>
          <Link href="/fr/form-builder" className="block" lang="fr" locale={false}>
            Français
          </Link>
        </p>
      </div>
    </>
  );
}
