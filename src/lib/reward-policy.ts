/** Event rules carried forward from the executable 2025 rewards flow. */
export const LEGACY_REWARD_POLICY = {
  pointsPerVenue: 100,
  surveyPoints: 100,
  pointsRequired: 200,
  pointExchangeEnabled: false,
};

export type RewardPolicy = typeof LEGACY_REWARD_POLICY;

export function rewardPolicy(value?: unknown): RewardPolicy {
  const input = value && typeof value === "object" ? value as Partial<RewardPolicy> : {};
  const amount = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100_000 ? value : fallback;
  return {
    pointsPerVenue: amount(input.pointsPerVenue, LEGACY_REWARD_POLICY.pointsPerVenue),
    surveyPoints: amount(input.surveyPoints, LEGACY_REWARD_POLICY.surveyPoints),
    pointsRequired: amount(input.pointsRequired, LEGACY_REWARD_POLICY.pointsRequired),
    pointExchangeEnabled: input.pointExchangeEnabled === true,
  };
}

export function activityAward(activity: { pointsEnabled?: boolean; pointsAwarded?: number }, rules: RewardPolicy) {
  return activity.pointsEnabled && activity.pointsAwarded !== 0 ? rules.pointsPerVenue : 0;
}

export function hasVenueActivityAward(transactions: Array<{ activityId?: string; venueId?: string; points: number; reversedAt?: string }>, venueId: string) {
  return transactions.some(item => item.activityId && item.venueId === venueId && item.points > 0 && !item.reversedAt);
}

export function rewardProgress(points: number, rules: RewardPolicy) {
  const total = Number.isFinite(points) ? Math.max(0, points) : 0;
  return {
    points: total,
    required: rules.pointsRequired,
    remaining: Math.max(0, rules.pointsRequired - total),
    percent: rules.pointsRequired === 0 ? 100 : Math.min(100, total / rules.pointsRequired * 100),
    eligible: total >= rules.pointsRequired,
  };
}
