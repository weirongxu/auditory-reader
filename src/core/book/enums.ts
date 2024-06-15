export const sortOrders = [
  'default',
  'reverse',
  'name',
  'name-reverse',
] as const
export type SortOrder = (typeof sortOrders)[number]
