import { z } from 'zod'

export const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
export const eventInputSchema = z.object({
  title: z.string().trim().min(1, 'タイトルは1文字以上です').max(80, 'タイトルは80文字以内です'),
  summary: z.string().trim().min(20, '概要は20文字以上です').max(160, '概要は160文字以内です'),
  body: z.unknown().refine((value) => value != null, '本文は必須です'),
  startsAt: z.coerce.date().nullable().optional(), endsAt: z.coerce.date().nullable().optional(),
}).superRefine((value, ctx) => {
  if ((value.startsAt == null) !== (value.endsAt == null)) ctx.addIssue({ code: 'custom', message: '公開には開始・終了日時を両方入力するか、両方空にしてください', path: ['endsAt'] })
  if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) ctx.addIssue({ code: 'custom', message: '終了日時は開始日時より後にしてください', path: ['endsAt'] })
})
export const mediaInputSchema = z.object({ alt: z.string(), rightsNote: z.string(), mimeType: z.enum(imageMimeTypes), size: z.number().max(10 * 1024 * 1024, '画像は10MB以下です') }).superRefine((value, ctx) => {
  if (!value.alt.trim()) ctx.addIssue({ code: 'custom', message: '画像の代替テキストは必須です', path: ['alt'] })
  if (!value.rightsNote.trim()) ctx.addIssue({ code: 'custom', message: '権利メモは必須です', path: ['rightsNote'] })
})
