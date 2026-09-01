// Vercel Blobのストレージ使用量を取得・判定する。
//
// 当初は課金/使用量API(`/v1/billing/charges`)でBlobのStorage・Data Transfer両方を
// 取得する想定だったが、Hobbyプランでは`costs_not_found`で404になり利用できないことが
// 実地確認で分かった。代わりに`/v1/storage/stores`(Blob管理API)はHobbyでも利用でき、
// 各Blob storeの現在のストレージサイズ(size, バイト)が取得できるため、これを使う。
// Data Transfer(配信転送量)はこのAPIには含まれておらず、Hobbyプランで取得できる
// 公式APIが見つからなかったため、フェーズ1の監視対象からは外している。
const DEFAULT_BLOB_STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024 // 1GB
export const NOTIFY_THRESHOLDS = [60, 70, 80, 90] as const

type VercelStorageStore = { type: string; size?: number }

export type BlobUsage = { usedBytes: number; limitBytes: number; percent: number }

export async function fetchBlobStorageUsage(input: { apiToken: string; teamId: string; limitBytes?: number }): Promise<BlobUsage> {
  const response = await fetch(`https://api.vercel.com/v1/storage/stores?teamId=${encodeURIComponent(input.teamId)}`, {
    headers: { Authorization: `Bearer ${input.apiToken}` },
  })
  if (!response.ok) throw new Error(`Vercel storage stores API failed: ${response.status}`)
  const data = (await response.json()) as { stores?: VercelStorageStore[] }
  const usedBytes = (data.stores ?? []).filter((store) => store.type === 'blob').reduce((sum, store) => sum + (store.size ?? 0), 0)
  const limitBytes = input.limitBytes ?? DEFAULT_BLOB_STORAGE_LIMIT_BYTES
  return { usedBytes, limitBytes, percent: (usedBytes / limitBytes) * 100 }
}

// 現在の使用率(percent)と、直前まで通知済みだった閾値(lastNotifiedThreshold)から、
// 新たに超過して通知すべき閾値を返す。跨いでいなければnull。
export function determineThresholdToNotify(percent: number, lastNotifiedThreshold: number): number | null {
  const crossed = NOTIFY_THRESHOLDS.filter((threshold) => percent >= threshold)
  if (crossed.length === 0) return null
  const highest = Math.max(...crossed)
  return highest > lastNotifiedThreshold ? highest : null
}

export function currentPeriodKey(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}
