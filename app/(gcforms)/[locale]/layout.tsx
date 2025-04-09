import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { getSomeFlags } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { Suspense } from "react";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const featureFlags = await getSomeFlags([
    FeatureFlags.addressComplete,
    FeatureFlags.apiAccess,
    FeatureFlags.saveAndResume,
    FeatureFlags.formTimer,
    FeatureFlags.hCaptcha,
    FeatureFlags.caretakerPeriod,
  ]);

  /*
<link
          fetchPriority="high"
          rel="stylesheet"
          href="https://cdn.design-system.alpha.canada.ca/@cdssnc/gcds-utility@1.7.0/dist/gcds-utility.min.css"
        />
        */

  return (
    <>
      <ReactHydrationCheck />
      <Suspense>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link fetchPriority="high" rel="stylesheet" href="/static/styles/frontend.css" />
      </Suspense>
      <ClientContexts session={session} featureFlags={featureFlags}>
        {children}
      </ClientContexts>
    </>
  );
}
