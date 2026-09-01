'use client'

import { useField } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const MAX_INPUT_BYTES = 50 * 1024 * 1024
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024
const MAX_DIMENSION = 2000
const WEBP_QUALITY = 0.85
const RESIZED_MARKER = '__rgMallResized'
const TOO_LARGE_MESSAGE = '画像のサイズが大きすぎます。10MB以下にリサイズしてから再度アップロードしてください。'

type Source = 'paste' | 'select'

async function resizeImageFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unsupported')
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/webp', WEBP_QUALITY)
    })
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}

function markResized(file: File) {
  Object.defineProperty(file, RESIZED_MARKER, { value: true, enumerable: false })
  return file
}

function isResized(file: File) {
  return Boolean((file as unknown as Record<string, boolean>)[RESIZED_MARKER])
}

function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

// Upload-enabled collectionの「file」フィールドを監視し、選択された画像をブラウザ内で
// 自動リサイズ(長辺2000px・webp化)してから送信する。標準のDropzone/URLペースト/
// クリップボード貼り付けのどの経路で選択されても、フォームの値が変わった時点で
// このeffectが発火する。Vercel Functionsのボディサイズ上限による413エラー
// (Payload標準の英語メッセージ「Your request was too large to submit successfully.」
// でしか表示されず、アプリ側からは文言を差し替えられない)を、送信データを事前に
// 小さくすることで回避する。
//
// Payload標準のサムネイル/削除ボタンは、Upload_v4コンポーネント内部のfileSrcという
// 別ステートを経由してしか表示されず、controlsスロットからsetValueするだけでは
// 反映されない。そのため、プレビュー・取り消しボタン・処理中表示はここで自前に描画する。
export const AutoResizeUploadControl: React.FC = () => {
  const { setValue, value } = useField<File | null>({ path: 'file' })
  const processing = useRef(false)
  const previewUrlRef = useRef<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<{ url: string; sizeLabel: string; sourceLabel: string | null } | null>(null)

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setPreview(null)
  }, [])

  useEffect(() => clearPreview, [clearPreview])

  useEffect(() => {
    // valueはPayload標準UI(Upload_v4)側の削除ボタン等、このコンポーネントの外からも
    // nullにされうる外部状態のため、その変化に追従してプレビューを消す必要がある。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!(value instanceof File)) clearPreview()
  }, [value, clearPreview])

  const applyResizedFile = useCallback(
    (file: File, source: Source) => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      setPreview({ url, sizeLabel: formatMb(file.size), sourceLabel: source === 'paste' ? 'クリップボードから貼り付けました' : null })
      setValue(markResized(file))
      if (source === 'paste') toast.success('クリップボードから画像を貼り付けました')
    },
    [setValue],
  )

  const processFile = useCallback(
    async (file: File, source: Source) => {
      if (isResized(file)) return
      if (!file.type.startsWith('image/')) return
      if (processing.current) return

      if (file.size > MAX_INPUT_BYTES) {
        toast.error(TOO_LARGE_MESSAGE)
        setValue(null)
        return
      }

      processing.current = true
      setIsProcessing(true)
      try {
        const resized = await resizeImageFile(file)
        if (resized.size > MAX_OUTPUT_BYTES) {
          toast.error(TOO_LARGE_MESSAGE)
          setValue(null)
          return
        }
        applyResizedFile(resized, source)
      } catch {
        // ブラウザ側でのリサイズに失敗した場合はサーバー側のsharp処理に委ねる。
        // 明らかに大きすぎる場合のみ、ここで先に弾く。
        if (file.size > MAX_OUTPUT_BYTES) {
          toast.error(TOO_LARGE_MESSAGE)
          setValue(null)
          return
        }
        applyResizedFile(file, source)
      } finally {
        processing.current = false
        setIsProcessing(false)
      }
    },
    [setValue, applyResizedFile],
  )

  // 標準Dropzone/URLペースト経由の選択を検知してリサイズする。valueはPayload標準UI側で
  // 変わる外部状態のため、その変化を起点に(effect内から)非同期処理を開始する必要がある。
  useEffect(() => {
    if (!(value instanceof File)) return
    if (isResized(value)) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void processFile(value, 'select')
  }, [value, processFile])

  // Ctrl/Cmd+Vでのクリップボード画像貼り付けに対応する。alt等のテキスト入力欄への
  // 通常のペーストを妨げないよう、テキスト入力にフォーカスしている間は無視する。
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const active = document.activeElement
      const isTextInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active instanceof HTMLElement && active.isContentEditable)
      if (isTextInput) return

      const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'))
      const file = imageItem?.getAsFile()
      if (!file) return

      event.preventDefault()
      void processFile(file, 'paste')
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [processFile])

  const handleCancel = useCallback(() => setValue(null), [setValue])

  if (isProcessing) {
    return <p style={{ fontSize: 13, opacity: 0.7, margin: '8px 0 0' }}>画像を処理中…</p>
  }

  // Payload標準のUploadControlsスロットは「ファイルを選択」「または」「URLを貼り付け」
  // ボタンと同じ行に並ぶため、ここに続けてクリップボード貼り付けの案内を出す。
  if (!preview) return <span style={{ fontSize: 13, opacity: 0.7 }}>／画像をペースト</span>

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 0' }}>
      <img src={preview.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--theme-elevation-150, #ccc)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {preview.sourceLabel && <span style={{ fontSize: 12, opacity: 0.7 }}>{preview.sourceLabel}</span>}
        <span style={{ fontSize: 12, opacity: 0.7 }}>{preview.sizeLabel}</span>
        <button
          type="button"
          onClick={handleCancel}
          style={{ fontSize: 12, width: 'fit-content', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
        >
          取り消す
        </button>
      </div>
    </div>
  )
}

export default AutoResizeUploadControl
