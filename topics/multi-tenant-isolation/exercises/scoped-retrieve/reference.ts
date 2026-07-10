// Reference solution — authz pre-filter THEN rank. The tenant filter is applied
// before ranking so another tenant's higher-scoring doc can never surface.
// (Kept out of the repo's starter; used only to sandbox-verify the exercise.)
export interface Doc {
  id: string;
  tenantId: string;
  score: number;
}

export function scopedRetrieve(docs: Doc[], tenantId: string, k: number): string[] {
  return docs
    .filter((d) => d.tenantId === tenantId) // authorization pre-filter
    .sort((a, b) => b.score - a.score) // rank by score desc within tenant
    .slice(0, k) // cap at k (fewer matches -> return all)
    .map((d) => d.id);
}
