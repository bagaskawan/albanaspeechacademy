// Remounts per navigation: the new page fades in (opacity only, 160 ms) instead of popping.
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <div className="admin-page-enter">{children}</div>;
}
