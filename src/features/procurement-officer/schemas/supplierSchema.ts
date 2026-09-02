import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(1, 'Required'),
  tin_number: z.string().optional(),
  category_id: z
    .number({ message: 'Please select a category' })
    .int()
    .positive('Please select a category'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_active: z.boolean(),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_province: z.string().optional(),
  address_zip: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
