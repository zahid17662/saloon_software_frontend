import { Dashboard } from "@/components/admin/dashboard";

// This page loads its data in the browser through admin-only Server Actions, so there is no
// server-rendered content to validate.
export const instant = false;

export default function Page() {
  return <Dashboard />;
}
