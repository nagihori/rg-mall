export function normalizeTitle(value: string) { return value.trim().replace(/\s+/g, ' ') }
export function normalizeSummary(value: string) { return value.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ') }
export function slugFromTitle(value: string) {
  const normalized = normalizeTitle(value)
  const asciiSlug = normalized.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  // 日本語などASCIIに落ちない文字だけのタイトルは全部'event'に潰れて判別できないURLになるため、
  // タイトルをそのままパーセントエンコードしてslugにする（URLバーでは大抵デコードされて日本語のまま読める）。
  if (asciiSlug) return asciiSlug
  return encodeURIComponent(normalized.replace(/\s+/g, '-')) || 'event'
}
export function numberedSlug(base: string, taken: readonly string[]) {
  if (!taken.includes(base)) return base
  let n = 2; while (taken.includes(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
