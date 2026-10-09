import { z } from 'zod'

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, 'タイトルは1文字以上です').max(80, 'タイトルは80文字以内です'),
  summary: z.string().trim().min(1, '概要は必須です').max(160, '概要は160文字以内です'),
  body: z.unknown(),
  startsAt: z.coerce.date().nullable().optional(), endsAt: z.coerce.date().nullable().optional(),
  location: z.string().trim().max(120, '場所は120文字以内です').nullable().optional(),
}).superRefine((value, ctx) => {
  // 開始日時が無いとトップページの分類(開催中/開催予定など)に乗らないため、確認依頼の時点で必須にする。
  if (!value.startsAt && !value.endsAt) ctx.addIssue({ code: 'custom', message: '開始日時を入力してください（未設定だとトップページに正しく表示されません）', path: ['startsAt'] })
  // 終了日時未定のイベントもあるため、開始日時のみの登録は許可する（終了日時のみは不可）。
  if (value.endsAt && !value.startsAt) ctx.addIssue({ code: 'custom', message: '終了日時のみの入力はできません。開始日時も入力してください', path: ['startsAt'] })
  if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) ctx.addIssue({ code: 'custom', message: '終了日時は開始日時より後にしてください', path: ['endsAt'] })
})
