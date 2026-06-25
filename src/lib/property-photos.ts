import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type PropertyPhotosClient = SupabaseClient<Database>;
type PropertyPhotoInsert = Database["public"]["Tables"]["property_photos"]["Insert"];

export async function syncPropertyPhotos(
  supabase: PropertyPhotosClient,
  propertyId: string,
  images: string[],
  photoAltTexts?: Record<string, string>
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("property_photos")
    .delete()
    .eq("property_id", propertyId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (images.length === 0) return;

  const photoRows: PropertyPhotoInsert[] = images.map((url, i) => ({
    property_id: propertyId,
    url,
    ordering_index: i,
    alt_text: photoAltTexts?.[url] || null,
  }));

  const { error: insertError } = await supabase.from("property_photos").insert(photoRows as never);

  if (insertError) {
    throw new Error(insertError.message);
  }
}
