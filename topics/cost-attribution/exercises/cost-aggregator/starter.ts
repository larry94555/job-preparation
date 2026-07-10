export interface CostRecord {
  feature: string;
  cost: number;
  success: boolean;
}
export interface FeatureRollup {
  cost: number;
  successes: number;
  costPerSuccess: number | null;
}
export interface Report {
  total: number;
  byFeature: Record<string, FeatureRollup>;
}

/**
 * TODO:
 *   total            = sum of every record.cost
 *   byFeature[f].cost      = sum of costs for feature f
 *   byFeature[f].successes = count of records for f with success === true
 *   byFeature[f].costPerSuccess = cost / successes when successes > 0, else null (never NaN)
 */
export function aggregate(records: CostRecord[]): Report {
  throw new Error("not implemented");
}
