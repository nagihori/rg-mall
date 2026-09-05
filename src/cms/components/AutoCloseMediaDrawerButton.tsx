'use client'

import { SaveButton, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

// 本文(richText)へのアップロードや、メイン画像/ギャラリー画像の「メディアを新規追加」は、
// いずれもドロワー内でメディアを新規作成するフロー。保存してもドロワーは自動で閉じない
// (Payload標準の挙動)ため、毎回手動で閉じるひと手間が発生していた。
// ここでは新規作成(idが未確定→確定)を検知した時だけ、自分が属する一番近いドロワーを
// 自動で閉じる。ドロワーの外(通常の一覧・編集画面)では何もせず、既存メディアの編集時にも
// 発火しない(閉じた直後に再度編集を続けたい場合があるため)。
export const AutoCloseMediaDrawerButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const hadIdRef = useRef(Boolean(id))
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const justCreated = Boolean(id) && !hadIdRef.current
    hadIdRef.current = Boolean(id)
    if (!justCreated) return
    const drawer = anchorRef.current?.closest<HTMLElement>('[id^="doc-drawer_"]')
    if (!drawer) return
    drawer.querySelector<HTMLButtonElement>(`#close-drawer__${CSS.escape(drawer.id)}`)?.click()
  }, [id])

  return (
    <div ref={anchorRef} style={{ display: 'contents' }}>
      <SaveButton />
    </div>
  )
}

export default AutoCloseMediaDrawerButton
