export function computeStats(data) {
  if (!data || data.length === 0) return { records: 0, features: 0, missingPercent: 0 };

  const fields = Object.keys(data[0]);
  const totalCells = data.length * fields.length;
  let missingCount = 0;

  for (const row of data) {
    for (const field of fields) {
      if (row[field] === null || row[field] === undefined || row[field] === '') {
        missingCount++;
      }
    }
  }

  return {
    records: data.length,
    features: fields.length,
    missingPercent: totalCells > 0 ? ((missingCount / totalCells) * 100) : 0,
  };
}

export function computeColumnStats(data) {
  if (!data || data.length === 0) return [];

  const fields = Object.keys(data[0]);

  return fields.map((field) => {
    let missingCount = 0;
    let numericCount = 0;
    let totalValid = 0;

    for (const row of data) {
      const val = row[field];
      if (val === null || val === undefined || val === '') {
        missingCount++;
      } else {
        totalValid++;
        if (typeof val === 'number' || (!isNaN(Number(val)) && val !== true && val !== false)) {
          numericCount++;
        }
      }
    }

    const missingPercent = (missingCount / data.length) * 100;
    const isNumeric = totalValid > 0 && numericCount / totalValid > 0.8;

    return {
      name: field,
      type: isNumeric ? 'Numerical' : 'Categorical',
      missingPercent: Math.round(missingPercent * 10) / 10,
      actionNeeded: missingPercent >= 5 ? 'FILL MISSING VALUES' : 'READY',
    };
  });
}

export function computeClassBalance(data, targetCol) {
  if (!data || !targetCol || data.length === 0) {
    return { labels: [], counts: [], percentages: [], isImbalanced: false };
  }

  const counts = {};
  let total = 0;

  for (const row of data) {
    const val = row[targetCol];
    if (val !== null && val !== undefined && val !== '') {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
      total++;
    }
  }

  const labels = Object.keys(counts);
  const countsArr = labels.map((l) => counts[l]);
  const percentages = countsArr.map((c) => Math.round((c / total) * 100));

  const max = Math.max(...countsArr);
  const min = Math.min(...countsArr);
  const isImbalanced = min > 0 && max / min > 2;

  return { labels, counts: countsArr, percentages, isImbalanced };
}
