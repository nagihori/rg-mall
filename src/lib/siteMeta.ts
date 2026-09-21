export const SITE_NAME = 'ルーガンド商会 商店街'
export const SITE_DESCRIPTION = 'FC「ルーガンド商会」のイベントお知らせページ'

// 管理画面のメタ情報タブで編集できるtitleテンプレートの既定値。{{site_title}}等の変数は renderMetaTemplate で置換する
export const DEFAULT_HOME_TITLE_TEMPLATE = 'イベントのお知らせ « {{site_title}}'
export const DEFAULT_EVENT_TITLE_TEMPLATE = '{{event_title}} « {{site_title}}'
export const DEFAULT_STORE_TITLE_TEMPLATE = '{{store_title}} « {{site_title}}'

// title/descriptionテンプレート中の {{変数名}} をvarsの値で置換する。未定義の変数は空文字に落とす
export function renderMetaTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, key: string) => vars[key] ?? '')
}
