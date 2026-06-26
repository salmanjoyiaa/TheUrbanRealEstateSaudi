export function sanitizePropertyRefQuery(raw: string | undefined | null): string {
  return (raw ?? "").trim().replace(/[%_]/g, "");
}

export function matchesPropertyRef(
  propertyRef: string | null | undefined,
  query: string
): boolean {
  const q = sanitizePropertyRefQuery(query).toLowerCase();
  if (!q) return true;
  return (propertyRef ?? "").toLowerCase().includes(q);
}
