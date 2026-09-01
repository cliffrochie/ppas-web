import { z } from 'zod';

// Zod v4 uses `{ message }` for all error customisation (required_error /
// invalid_type_error were removed in the v4 redesign).
const itemSchema = z.object({
  item_description: z.string().min(1, 'Item name is required'),
  unit_cost: z
    .number({ message: 'Enter a valid price' })
    .positive('Price must be greater than 0'),
  quantity: z
    .number({ message: 'Enter a valid quantity' })
    .int('Must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  specifications: z.string(),
});

export const createRequestSchema = z.object({
  requester_id: z
    .number({ message: 'Please select an end-user' })
    .int()
    .positive('Please select an end-user'),
  category_id: z
    .number({ message: 'Please select a category' })
    .int()
    .positive('Please select a category'),
  purpose: z.string().min(1, 'Justification is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

export type CreateRequestFormValues = z.infer<typeof createRequestSchema>;
