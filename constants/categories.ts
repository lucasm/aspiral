export const categories = ['news', 'economy', 'tech', 'sport', 'culture', 'geek', 'science', 'travel', 'check', 'dscvr'] as const

export type Category = (typeof categories)[number]

export function isCategory(value: string): value is Category {
  return categories.includes(value as Category)
}
