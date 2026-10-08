'use client'

import { createPortal } from 'react-dom'
import { useFormProcessing } from '@payloadcms/ui'

// 保存・ステータス変更などの処理中に、画面全体へ「今は操作できない」ことを伝えるオーバーレイ。
// 通知送信などでサーバー応答が遅いとき、ボタンが押せるように見えて二重操作されるのを防ぐ。
// Payloadのフォーム送信中(useFormProcessing)に連動し、フォーム外の処理(送信後の再読み込み等)は
// active で呼び出し側から明示的に立てる。ポータルでbody直下に出して、親要素の都合に左右されないようにする。
export const ProcessingOverlay: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const processing = useFormProcessing()
  // 処理中になるのは操作後(=ハイドレーション後)だけだが、SSR中にdocumentを触らないよう念のため守る。
  if (typeof document === 'undefined' || !(processing || active)) return null

  return createPortal(
    <div className="processing-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="processing-overlay__box">
        <span className="processing-overlay__spinner" aria-hidden="true" />
        <span>処理中です。しばらくお待ちください</span>
      </div>
    </div>,
    document.body,
  )
}

export default ProcessingOverlay
