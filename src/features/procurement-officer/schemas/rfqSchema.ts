import { z } from 'zod';

// ─── RFQ create ───────────────────────────────────────────────────────────────

export const rfqSchema = z.object({
  purchase_request_id: z
    .number({ message: 'Please select a purchase request' })
    .int()
    .positive('Please select a purchase request'),
  prepared_by_id: z
    .number({ message: 'Please select a preparer' })
    .int()
    .positive('Please select a preparer'),
  deadline: z.string().optional(),
});

export type RfqFormValues = z.infer<typeof rfqSchema>;

// ─── RFQ edit (prepared_by / deadline / status) ───────────────────────────────

export const rfqEditSchema = z.object({
  prepared_by_id: z.number({ message: 'Please select a preparer' }).int().positive(),
  deadline: z.string().optional(),
  status: z.enum(['draft', 'for_signature', 'signed', 'canvassing', 'closed']),
});

export type RfqEditValues = z.infer<typeof rfqEditSchema>;

// ─── Canvass response ─────────────────────────────────────────────────────────

export const canvassSchema = z.object({
  supplier_name: z.string().min(1, 'Required'),
  unit_price: z.number({ message: 'Enter a valid price' }).positive('Must be greater than 0'),
  total_price: z.number({ message: 'Enter a valid amount' }).positive('Must be greater than 0'),
  notes: z.string().optional(),
});

export type CanvassValues = z.infer<typeof canvassSchema>;

// ─── RFQ line item ────────────────────────────────────────────────────────────

export const rfqItemSchema = z.object({
  pr_item_id: z.number({ message: 'Please select a PR line item' }).int().positive(),
  item_description: z.string().min(1, 'Required'),
  unit_of_measure: z.string().min(1, 'Required'),
  quantity: z.number({ message: 'Enter a valid quantity' }).positive('Must be greater than 0'),
});

export type RfqItemValues = z.infer<typeof rfqItemSchema>;
