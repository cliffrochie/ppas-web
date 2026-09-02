import { z } from 'zod';

// ─── Notice of Award create ───────────────────────────────────────────────────

export const noticeOfAwardSchema = z.object({
  noa_number: z.string().min(1, 'Required'),
  bac_resolution_id: z
    .number({ message: 'Please select a BAC resolution' })
    .int()
    .positive('Please select a BAC resolution'),
  awarded_supplier: z.string().min(1, 'Required'),
  awarded_amount: z.number({ message: 'Enter a valid amount' }).positive('Must be greater than 0'),
  issued_at: z.string().optional(),
});

export type NoticeOfAwardFormValues = z.infer<typeof noticeOfAwardSchema>;

// ─── Notice of Award edit ─────────────────────────────────────────────────────

export const noticeOfAwardEditSchema = z.object({
  noa_number: z.string().min(1, 'Required'),
  awarded_supplier: z.string().min(1, 'Required'),
  awarded_amount: z.number({ message: 'Enter a valid amount' }).positive('Must be greater than 0'),
  issued_at: z.string().optional(),
});

export type NoticeOfAwardEditValues = z.infer<typeof noticeOfAwardEditSchema>;
