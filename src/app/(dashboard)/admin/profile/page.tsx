import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountProfileForm } from "@/components/dashboard/account-profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, role, created_at")
    .eq("id", user.id)
    .single()) as {
    data: {
      id: string;
      email: string;
      full_name: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      created_at: string;
    } | null;
  };

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <AccountProfileForm
      initial={{
        ...profile,
        email: user.email ?? profile.email,
      }}
      roleLabel="Admin"
    />
  );
}
