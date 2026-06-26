import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizePropertyRefQuery } from "@/lib/property-ref";

type AdminClient = ReturnType<typeof createAdminClient>;

export { sanitizePropertyRefQuery };

/** Resolve property UUIDs whose property_ref partially matches the query (case-insensitive). */
export async function resolvePropertyIdsByRef(
  supabase: AdminClient,
  rawQuery: string | undefined | null
): Promise<string[]> {
  const q = sanitizePropertyRefQuery(rawQuery);
  if (!q) return [];

  const { data, error } = (await supabase
    .from("properties")
    .select("id")
    .not("property_ref", "is", null)
    .ilike("property_ref", `%${q}%`)) as {
    data: { id: string }[] | null;
    error: { message: string } | null;
  };

  if (error) {
    console.error("[resolvePropertyIdsByRef]", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.id);
}
