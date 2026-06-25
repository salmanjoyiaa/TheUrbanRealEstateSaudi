import { revalidatePath } from "next/cache";
import { isRedisEnabled } from "@/lib/redis";
import { Redis } from "@upstash/redis";

export function revalidatePropertyPages(propertyId: string) {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
}

export async function invalidatePropertiesListCache() {
  if (!isRedisEnabled()) return;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: "properties:list:*", count: 100 });
    cursor = Number(nextCursor);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== 0);
}

export async function afterPropertySaved(propertyId: string) {
  revalidatePropertyPages(propertyId);
  await invalidatePropertiesListCache();
}
