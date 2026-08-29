import { put, del } from '@vercel/blob'

export interface MediaStorage { upload(key: string, file: Blob): Promise<{ storageKey: string; url: string }>; remove(url: string): Promise<void> }
export const vercelBlobMediaStorage: MediaStorage = {
  async upload(key, file) { const result = await put(key, file, { access: 'public', addRandomSuffix: true }); return { storageKey: result.pathname, url: result.url } },
  async remove(url) { await del(url) },
}
