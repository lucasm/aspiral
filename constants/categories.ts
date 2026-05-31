export const categories = ['news', 'biz', 'tech', 'sport', 'cult', 'geek', 'sci', 'travel', 'check', 'dscvr'] as const

export type Category = (typeof categories)[number]

export function isCategory(value: string): value is Category {
  return categories.includes(value as Category)
}
