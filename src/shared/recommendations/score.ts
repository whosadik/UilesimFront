function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isRerankerScore(components: unknown): boolean {
  if (!isRecord(components)) {
    return false;
  }

  const mode = typeof components.mode === 'string' ? components.mode.toLowerCase() : '';
  return mode === 'reranker' || components.reranker_prob !== undefined;
}

function isPopularityOnlyScore(components: unknown): boolean {
  if (!isRecord(components)) {
    return false;
  }

  const mode = typeof components.mode === 'string' ? components.mode.toLowerCase() : '';
  const source = typeof components.source === 'string' ? components.source.toLowerCase() : '';

  return (
    mode === 'trending' ||
    mode === 'cold_start' ||
    source === 'trending_popularity' ||
    (components.popularity !== undefined &&
      components.content === undefined &&
      components.reranker_prob === undefined &&
      components.cooccurrence === undefined)
  );
}

function rawRankScoreToPercent(score: number): number {
  return clampPercent((1 - Math.exp(-score / 0.85)) * 100);
}

function rerankerProbabilityToPercent(score: number): number {
  return clampPercent((1 - Math.exp(-score / 0.011)) * 100);
}

export function recommendationScoreToPercent(value: unknown, components?: unknown): number | undefined {
  if (isPopularityOnlyScore(components)) {
    return undefined;
  }

  const score = toNumber(value);
  if (score === undefined) {
    return undefined;
  }

  if (score <= 0) {
    return 0;
  }

  if (isRerankerScore(components) && score < 1) {
    return rerankerProbabilityToPercent(score);
  }

  if (score < 1) {
    return clampPercent(score * 100);
  }

  if (score < 10) {
    return rawRankScoreToPercent(score);
  }

  return clampPercent(score);
}
