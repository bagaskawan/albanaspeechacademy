import { academyRequest } from "@/lib/server/academy-api";
import { readPublishedContacts } from "@/lib/server/public-contacts";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader({ home = false }: { home?: boolean } = {}) {
  let showTrainer = false;
  let showContact = false;
  try {
    const [trainers, contacts] = await Promise.all([
      academyRequest("trainers?select=slug&limit=1"),
      readPublishedContacts(),
    ]);
    showTrainer = Array.isArray(trainers) && trainers.length > 0;
    showContact = contacts.length > 0;
  } catch { /* The always available anchors remain visible. */ }
  return <SiteHeaderClient showTrainer={showTrainer} showContact={showContact} home={home} />;
}
