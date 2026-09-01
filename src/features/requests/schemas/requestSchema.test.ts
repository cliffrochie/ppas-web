import { describe, expect, it } from 'vitest';
import { createRequestSchema } from './requestSchema';

const validItem = {
  item_description: 'Bond paper A4',
  unit_cost: 250,
  quantity: 3,
  specifications: '',
};

const valid = {
  requester_id: 12,
  category_id: 4,
  purpose: 'Office supplies for Q3',
  items: [validItem],
};

describe('createRequestSchema', () => {
  it('accepts a valid request with one item', () => {
    expect(createRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('requires at least one item', () => {
    const result = createRequestSchema.safeParse({ ...valid, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive requester_id', () => {
    expect(createRequestSchema.safeParse({ ...valid, requester_id: 0 }).success).toBe(false);
  });

  it('rejects a missing category_id', () => {
    const withoutCategory = {
      requester_id: valid.requester_id,
      purpose: valid.purpose,
      items: valid.items,
    };
    expect(createRequestSchema.safeParse(withoutCategory).success).toBe(false);
  });

  it('rejects an empty purpose', () => {
    expect(createRequestSchema.safeParse({ ...valid, purpose: '' }).success).toBe(false);
  });

  it('rejects an item with a zero or negative unit_cost', () => {
    const result = createRequestSchema.safeParse({
      ...valid,
      items: [{ ...validItem, unit_cost: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a fractional quantity', () => {
    const result = createRequestSchema.safeParse({
      ...valid,
      items: [{ ...validItem, quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });
});
