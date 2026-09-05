const LODESTONE_CHARACTER_URL = /^https:\/\/jp\.finalfantasyxiv\.com\/lodestone\/character\/\d+\/?$/

// キャラクターIDだけの入力(数字のみ)は正規のLodestone URLへ組み立てる。
// 既にURL形式で入力された場合はそのまま返す(正しいURLかどうかはisLodestoneCharacterUrlで別途検証する)。
export function normalizeLodestoneCharacterInput(value: string): string {
  const trimmed = value.trim()
  return /^\d+$/.test(trimmed) ? `https://jp.finalfantasyxiv.com/lodestone/character/${trimmed}/` : trimmed
}
export function isLodestoneCharacterUrl(value: string): boolean {
  return LODESTONE_CHARACTER_URL.test(value)
}
