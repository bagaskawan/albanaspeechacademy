// Search box text → PostgREST `ilike` pattern. `%`/`_`/`\` are escaped so they match literally;
// `,` `(` `)` would break the filter syntax, so they become spaces.
export function ilikePattern(query: string): string {
  const safe = query.trim().replace(/[\\%_]/g, (character) => "\\" + character).replace(/[,()]/g, " ");
  return `%${safe}%`;
}
