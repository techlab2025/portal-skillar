export const PlacementTestEnum = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  FINISHED: 4
} as const;

export type PlacementTestEnum = (typeof PlacementTestEnum)[keyof typeof PlacementTestEnum];
