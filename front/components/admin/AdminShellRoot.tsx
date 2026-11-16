import { adminFont } from "@/lib/fonts/admin";

// Shared root for (admin) and (auth). The <style> re-declares --font-admin on <body>
// so Radix portals (dialogs, selects) rendered outside this div also get Poppins.
export function AdminShellRoot({ children }: { children: React.ReactNode }) {
  return <div className={`${adminFont.variable} admin-shell min-h-screen`}>
    <style>{`body:has(.admin-shell){--font-admin:${adminFont.style.fontFamily};}`}</style>
    {children}
  </div>;
}
