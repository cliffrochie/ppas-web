import { z } from 'zod';

// ─── Abstract of Quotation create ─────────────────────────────────────────────

export const abstractSchema = z.object({
  rfq_id: z.number({ message: 'Please select an RFQ' }).int().positive('Please select an RFQ'),
  prepared_by_id: z
    .number({ message: 'Please select a preparer' })
    .int()
    .positive('Please select a preparer'),
  recommended_supplier: z.string().optional(),
  recommended_amount: z.number().optional(),
});

export type AbstractFormValues = z.infer<typeof abstractSchema>;

// ─── Abstract of Quotation edit ───────────────────────────────────────────────

export const abstractEditSchema = z.object({
  prepared_by_id: z.number({ message: 'Please select a preparer' }).int().positive(),
  recommended_supplier: z.string().optional(),
  recommended_amount: z.number().optional(),
  status: z.enum(['draft', 'approved']),
  approved_at: z.string().optional(),
});

export type AbstractEditValues = z.infer<typeof abstractEditSchema>;
