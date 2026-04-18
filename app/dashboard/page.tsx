import { redirect } from "next/navigation"

// The legacy /dashboard was superseded by the calm /today room.
// Redirects keep old bookmarks and links working.
export default function DashboardRedirect() {
  redirect("/today")
}
