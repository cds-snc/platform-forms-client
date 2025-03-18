import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { CaptchaFail } from "./components/client/CaptchaFail";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("captcha", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page() {
  return <CaptchaFail />;
}
/*
# Your form could not be submitted

You might try to:
- Turn off a virtual private network (VPN), firewall, or proxy server, if you use one.
- Use a different browser, device, or network, if an alternate is available.
- Submit your form again later or contact the program or service directly.
*/

/*
# Votre formulaire n'a pas pu être soumis

Vous pouvez essayer de :
- Désactiver un réseau privé virtuel (VPN), un pare-feu ou un serveur proxy, si vous en utilisez un.
- Utiliser un autre navigateur, un autre appareil ou un autre réseau, si une alternative est disponible.
- Soumettre à nouveau votre formulaire plus tard ou contacter directement le programme ou le service.

*/
