'use client'

// 項目の多い編集画面で、まとまりの切れ目を示す見出し帯。入力欄ではなく表示だけの ui フィールド用。
export const SectionHeading: React.FC<{ label: string }> = ({ label }) => (
  <div className="admin-section-heading" role="heading" aria-level={3}>{label}</div>
)

export default SectionHeading
