import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isTeamMember } from "@/lib/supabase/guards";
import Dashboard from "./Dashboard";

export const metadata = {
  title: "Panel · C Digital",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Respaldo por si el middleware no corriera; la protección real está ahí.
  if (!user) {
    redirect("/login");
  }

  // Los clientes del panel también tienen sesión: el dashboard es solo del
  // equipo. Un cliente que llegue aquí va a su propio panel.
  if (!(await isTeamMember())) {
    redirect("/panel");
  }

  return <Dashboard userEmail={user.email ?? ""} />;
}
