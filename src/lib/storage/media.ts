import { put, del } from '@vercel/blob'

// Vercel実行環境ではSDKデフォルト(BLOB_READ_WRITE_TOKEN / OIDC接続)をそのまま使う。
// ローカル実行時のみBLOB_READ_WRITE_TOKEN_LOCALを明示指定して本番トークンと分離する。
const blobToken = process.env.VERCEL ? undefined : process.env.BLOB_LOCAL_READ_WRITE_TOKEN

export interface MediaStorage { upload(key: string, file: Blob): Promise<{ storageKey: string; url: string }>; remove(url: string): Promise<void> }
export const vercelBlobMediaStorage: MediaStorage = {
  async upload(key, file) { const result = await put(key, file, { access: 'public', addRandomSuffix: true, token: blobToken }); return { storageKey: result.pathname, url: result.url } },
  async remove(url) { await del(url, { token: blobToken }) },
}
