import { z } from 'zod';

// ─── BAC Resolution create ────────────────────────────────────────────────────

export const bacResolutionSchema = z.object({
  resolution_number: z.string().min(1, 'Required'),
  abstract_of_quotation_id: z
    .number({ message: 'Please select an abstract of quotation' })
    .int()
    .positive('Please select an abstract of quotation'),
  prepared_by_id: z
    .number({ message: 'Please select a preparer' })
    .int()
    .positive('Please select a preparer'),
  issued_at: z.string().optional(),
});

export type BacResolutionFormValues = z.infer<typeof bacResolutionSchema>;

// ─── BAC Resolution edit ──────────────────────────────────────────────────────

export const bacResolutionEditSchema = z.object({
  resolution_number: z.string().min(1, 'Required'),
  prepared_by_id: z.number({ message: 'Please select a preparer' }).int().positive(),
  issued_at: z.string().optional(),
});

export type BacResolutionEditValues = z.infer<typeof bacResolutionEditSchema>;
