import { AdminShellRoot } from "@/components/admin/AdminShellRoot";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShellRoot>{children}</AdminShellRoot>;
}
