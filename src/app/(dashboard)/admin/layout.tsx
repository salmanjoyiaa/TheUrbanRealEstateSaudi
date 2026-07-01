import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/layout/admin-shell";
import { DashboardLocaleShell } from "@/components/layout/locale-shells";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single()) as { data: { role: string; full_name: string; avatar_url: string | null } | null };

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <DashboardLocaleShell>
      <AdminShell userName={profile?.full_name} avatarUrl={profile?.avatar_url}>
        {children}
      </AdminShell>
    </DashboardLocaleShell>
  );
}
