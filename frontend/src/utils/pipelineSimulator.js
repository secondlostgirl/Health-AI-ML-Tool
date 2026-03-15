const STAGE_DELAY = 600;

export function runPipeline(config, data, onProgress, onLog) {
  const columnStats = data ? Object.keys(data[0] || {}) : [];
  const missingCol =
    columnStats.find((col) => {
      return data.some(
        (row) => row[col] === null || row[col] === undefined || row[col] === ''
      );
    }) || 'missing_column';

  const scalerNames = {
    standard: 'StandardScaler',
    minmax: 'MinMaxScaler',
    robust: 'RobustScaler',
    none: 'None (raw values)',
  };

  const imputationNames = {
    mean: 'Mean',
    median: 'Median',
    mode: 'Mode',
    knn: 'KNN Imputer',
  };

  const stages = [
    {
      progress: 25,
      log: 'Cleaning dataset & handling outliers.',
    },
    {
      progress: 50,
      log: `Imputing missing values for ${missingCol} using ${imputationNames[config.imputation] || config.imputation}.`,
    },
    {
      progress: 75,
      log: `Scaling numerical features using ${scalerNames[config.scaling] || config.scaling}.`,
    },
    {
      progress: 100,
      log: `Splitting data: ${config.trainTestSplit}% Training / ${100 - config.trainTestSplit}% Testing.`,
    },
  ];

  return new Promise((resolve) => {
    let stageIndex = 0;

    function runNextStage() {
      if (stageIndex >= stages.length) {
        resolve();
        return;
      }

      const stage = stages[stageIndex];
      onProgress(stage.progress);
      onLog(stage.log);
      stageIndex++;

      setTimeout(runNextStage, STAGE_DELAY);
    }

    setTimeout(runNextStage, STAGE_DELAY);
  });
}
