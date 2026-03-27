/**
 * Generates deterministic mock training results when the backend is unavailable.
 * Uses a simple hash of model + params to produce consistent but varied results.
 */

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(val, min = 0, max = 1) {
  return Math.min(max, Math.max(min, val));
}

export function generateMockResults(modelId, params) {
  const seed = hashCode(modelId + JSON.stringify(params));

  const accuracy = clamp(0.65 + seededRandom(seed + 1) * 0.28, 0.4, 0.98);
  const precision = clamp(0.60 + seededRandom(seed + 2) * 0.32, 0.35, 0.97);
  const recall = clamp(0.55 + seededRandom(seed + 3) * 0.38, 0.30, 0.98);
  const specificity = clamp(0.68 + seededRandom(seed + 4) * 0.25, 0.40, 0.98);
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;
  const auc = clamp(0.60 + seededRandom(seed + 5) * 0.32, 0.40, 0.98);

  const total = 200;
  const positives = Math.round(total * 0.4);
  const negatives = total - positives;
  const tp = Math.round(positives * recall);
  const fn = positives - tp;
  const tn = Math.round(negatives * specificity);
  const fp = negatives - tn;

  // Generate ROC curve points
  const numPoints = 12;
  const fpr = [0];
  const tpr = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    const t = i / (numPoints - 1);
    const baseFpr = t;
    const baseTpr = Math.pow(t, 1 / (1 + auc));
    fpr.push(clamp(baseFpr + seededRandom(seed + 10 + i) * 0.05 - 0.025));
    tpr.push(clamp(baseTpr + seededRandom(seed + 20 + i) * 0.05));
  }
  fpr.push(1);
  tpr.push(1);

  // Ensure monotonically increasing
  for (let i = 1; i < fpr.length; i++) {
    if (fpr[i] < fpr[i - 1]) fpr[i] = fpr[i - 1] + 0.01;
    if (tpr[i] < tpr[i - 1]) tpr[i] = tpr[i - 1] + 0.01;
  }

  return {
    model: modelId,
    params: { ...params },
    metrics: {
      accuracy: Math.round(accuracy * 1000) / 1000,
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      specificity: Math.round(specificity * 1000) / 1000,
      f1: Math.round(f1 * 1000) / 1000,
      auc: Math.round(auc * 1000) / 1000,
    },
    confusionMatrix: { tn, fp, fn, tp },
    rocCurve: { fpr, tpr, auc: Math.round(auc * 1000) / 1000 },
  };
}
