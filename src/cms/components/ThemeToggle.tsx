'use client'

import { useTheme } from '@payloadcms/ui'

// ヘッダー右上のライト/ダーク切り替え。標準ではアカウント画面の奥にしかなく気づきにくいため、常時出しておく。
// 表示は「今のテーマ」のアイコン(ライト=太陽/ダーク=月)で、押すと反対のテーマへ切り替える。
export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="admin-theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'ライトモードに切り替える' : 'ダークモードに切り替える'}
      title={isDark ? 'ライトモードに切り替える' : 'ダークモードに切り替える'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {isDark ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  )
}

export default ThemeToggle
