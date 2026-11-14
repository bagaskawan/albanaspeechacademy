import { contactHref, type ContactRow } from "@/lib/server/public-contacts";

const channelIcons = [
  {
    kind: "instagram",
    label: "Instagram",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
      </>
    ),
  },
  {
    kind: "email",
    label: "Email",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  {
    kind: "whatsapp",
    label: "WhatsApp",
    icon: (
      <>
        <path d="M21 11.6a9 9 0 0 1-13.4 8L3 21l1.3-4.6A9 9 0 1 1 21 11.6Z" />
        <path
          d="M8 7.5c-.6.4-.9 1.6-.4 2.8 1.3 3.1 3.5 5.3 6.8 6.1 1 .2 2.1-.5 2.4-1.6l-2.7-1.5-1 1c-1.7-.8-2.7-1.7-3.6-3.4l.8-1.2-1.2-2.4Z"
          fill="currentColor"
          strokeWidth=".7"
        />
      </>
    ),
  },
] as const;

export function academyChannels(contacts: ContactRow[]) {
  return channelIcons.flatMap((channel) => {
    const row = contacts.find((contact) => contact.kind === channel.kind);
    const href = row && contactHref(row);
    return href ? [{ label: channel.label, href, icon: channel.icon }] : [];
  });
}
