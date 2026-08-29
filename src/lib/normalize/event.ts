export function normalizeTitle(value: string) { return value.trim().replace(/\s+/g, ' ') }
export function normalizeSummary(value: string) { return value.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ') }
export function slugFromTitle(value: string) {
  const slug = normalizeTitle(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return slug || 'event'
}
export function numberedSlug(base: string, taken: readonly string[]) {
  if (!taken.includes(base)) return base
  let n = 2; while (taken.includes(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
