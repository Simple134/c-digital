import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "./Dashboard";

export const metadata = {
  title: "Panel · C Digital",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Respaldo por si el middleware no corriera; la protección real está ahí.
  if (!user) {
    redirect("/login");
  }

  return <Dashboard userEmail={user.email ?? ""} />;
}
