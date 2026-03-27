export const MODEL_DEFINITIONS = [
  {
    id: 'knn',
    name: 'KNN',
    fullName: 'K-Nearest Neighbors',
    description:
      'Classifies patients by finding the K most similar cases in the training data and using their outcomes to predict.',
    params: [
      {
        key: 'k',
        label: 'K (Neighbors)',
        type: 'slider',
        min: 1,
        max: 25,
        step: 2,
        default: 5,
        clinicalTooltip:
          'K controls how many nearby patients the model compares against. A low K (e.g. 3) makes decisions based on very few similar patients, which can be noisy. A higher K (e.g. 15) considers more patients, giving smoother but potentially less specific predictions.',
      },
      {
        key: 'distanceMetric',
        label: 'Distance Metric',
        type: 'dropdown',
        options: [
          { value: 'euclidean', label: 'Euclidean' },
          { value: 'manhattan', label: 'Manhattan' },
          { value: 'minkowski', label: 'Minkowski' },
        ],
        default: 'euclidean',
        clinicalTooltip:
          'Determines how "similarity" between patients is measured. Euclidean uses straight-line distance between feature values. Manhattan sums absolute differences, which can be more robust when features have different scales.',
      },
    ],
  },
  {
    id: 'svm',
    name: 'SVM',
    fullName: 'Support Vector Machine',
    description:
      'Finds the optimal boundary that best separates patient groups, maximising the margin between classes.',
    params: [
      {
        key: 'C',
        label: 'Regularisation (C)',
        type: 'slider',
        min: -2,
        max: 2,
        step: 0.25,
        default: 0,
        isLog: true,
        clinicalTooltip:
          'C controls the trade-off between a smooth decision boundary and classifying training patients correctly. A small C allows more misclassifications for a simpler model; a large C tries harder to classify every training patient correctly, risking overfitting.',
      },
      {
        key: 'kernel',
        label: 'Kernel',
        type: 'dropdown',
        options: [
          { value: 'linear', label: 'Linear' },
          { value: 'rbf', label: 'RBF (Radial)' },
          { value: 'poly', label: 'Polynomial' },
          { value: 'sigmoid', label: 'Sigmoid' },
        ],
        default: 'rbf',
        clinicalTooltip:
          'The kernel defines the shape of the decision boundary. Linear draws a straight line between classes. RBF can capture complex, non-linear patterns in patient data. Polynomial fits curved boundaries of varying degree.',
      },
      {
        key: 'gamma',
        label: 'Gamma',
        type: 'dropdown',
        options: [
          { value: 'scale', label: 'Scale (auto by features)' },
          { value: 'auto', label: 'Auto (1 / n_features)' },
        ],
        default: 'scale',
        clinicalTooltip:
          'Gamma controls how far the influence of a single training patient reaches. A small gamma means each patient influences a large area (smoother boundary). A large gamma means each patient only influences nearby points (more complex boundary).',
      },
    ],
  },
  {
    id: 'dt',
    name: 'Decision Tree',
    fullName: 'Decision Tree Classifier',
    description:
      'Creates a flowchart-like set of yes/no questions about patient features to arrive at a classification.',
    params: [
      {
        key: 'maxDepth',
        label: 'Max Depth',
        type: 'slider',
        min: 1,
        max: 20,
        step: 1,
        default: 5,
        clinicalTooltip:
          'Max depth limits how many levels of questions the tree can ask. A shallow tree (depth 3) is easy to interpret but may miss patterns. A deep tree (depth 15+) captures more detail but risks memorising the training data instead of learning general patterns.',
      },
      {
        key: 'criterion',
        label: 'Split Criterion',
        type: 'dropdown',
        options: [
          { value: 'gini', label: 'Gini Impurity' },
          { value: 'entropy', label: 'Entropy (Information Gain)' },
        ],
        default: 'gini',
        clinicalTooltip:
          'The criterion determines how the tree chooses the best question at each step. Gini impurity measures how often a randomly chosen patient would be misclassified. Entropy measures the information gained by each split. Both usually produce similar trees.',
      },
      {
        key: 'minSamplesSplit',
        label: 'Min Samples to Split',
        type: 'slider',
        min: 2,
        max: 20,
        step: 1,
        default: 2,
        clinicalTooltip:
          'The minimum number of patients required to split a node further. A higher value (e.g. 10) prevents the tree from creating branches based on very few patients, reducing overfitting. A lower value allows more granular splits.',
      },
    ],
  },
  {
    id: 'rf',
    name: 'Random Forest',
    fullName: 'Random Forest Classifier',
    description:
      'Builds many decision trees on random subsets of data and combines their votes for a more robust prediction.',
    params: [
      {
        key: 'nEstimators',
        label: 'Number of Trees',
        type: 'slider',
        min: 10,
        max: 500,
        step: 10,
        default: 100,
        clinicalTooltip:
          'The number of individual decision trees in the forest. More trees generally improve accuracy and stability but take longer to train. Beyond a certain point (often 100-200), adding more trees yields diminishing returns.',
      },
      {
        key: 'maxDepth',
        label: 'Max Depth per Tree',
        type: 'slider',
        min: 1,
        max: 20,
        step: 1,
        default: 5,
        clinicalTooltip:
          'Limits how deep each individual tree can grow. Shallower trees are simpler and less prone to overfitting. The ensemble effect of many shallow trees can still capture complex patterns.',
      },
      {
        key: 'criterion',
        label: 'Split Criterion',
        type: 'dropdown',
        options: [
          { value: 'gini', label: 'Gini Impurity' },
          { value: 'entropy', label: 'Entropy (Information Gain)' },
        ],
        default: 'gini',
        clinicalTooltip:
          'The criterion each tree uses to decide the best split. Gini impurity is faster to compute. Entropy can sometimes find slightly better splits. In practice, both perform similarly in random forests.',
      },
    ],
  },
  {
    id: 'lr',
    name: 'Logistic Regression',
    fullName: 'Logistic Regression',
    description:
      'Estimates the probability of a patient belonging to a class using a weighted combination of features passed through a sigmoid function.',
    params: [
      {
        key: 'C',
        label: 'Regularisation (C)',
        type: 'slider',
        min: -2,
        max: 2,
        step: 0.25,
        default: 0,
        isLog: true,
        clinicalTooltip:
          'C controls regularisation strength (inverse). A smaller C applies stronger regularisation, preventing the model from relying too heavily on any single feature. A larger C lets the model fit the training data more closely.',
      },
      {
        key: 'solver',
        label: 'Solver Algorithm',
        type: 'dropdown',
        options: [
          { value: 'lbfgs', label: 'LBFGS (default)' },
          { value: 'liblinear', label: 'Liblinear (small datasets)' },
          { value: 'saga', label: 'SAGA (large datasets)' },
        ],
        default: 'lbfgs',
        clinicalTooltip:
          'The optimisation algorithm used to find the best feature weights. LBFGS works well for most datasets. Liblinear is better for small datasets. SAGA handles large datasets and supports more regularisation options.',
      },
      {
        key: 'maxIter',
        label: 'Max Iterations',
        type: 'slider',
        min: 100,
        max: 1000,
        step: 100,
        default: 100,
        clinicalTooltip:
          'Maximum number of iterations for the solver to converge. If the model warns about convergence, increase this value. Higher values ensure the algorithm finds the optimal weights but take longer.',
      },
    ],
  },
  {
    id: 'nb',
    name: 'Naive Bayes',
    fullName: 'Gaussian Naive Bayes',
    description:
      'Applies Bayes\' theorem assuming features are independent, calculating the probability of each class given the patient\'s features.',
    params: [
      {
        key: 'varSmoothing',
        label: 'Variance Smoothing',
        type: 'slider',
        min: -12,
        max: -6,
        step: 0.5,
        default: -9,
        isLog: true,
        clinicalTooltip:
          'Adds a small value to feature variances to prevent zero-probability issues. A larger smoothing value makes the model less sensitive to individual feature variations, which can help with noisy clinical measurements.',
      },
    ],
  },
];

export const METRIC_DEFINITIONS = [
  {
    key: 'accuracy',
    label: 'Accuracy',
    clinicalInterpretation:
      'Overall percentage of patients correctly classified, both healthy and those with the condition.',
  },
  {
    key: 'precision',
    label: 'Precision',
    clinicalInterpretation:
      'Of all patients the model flagged as positive, how many actually had the condition. High precision means fewer false alarms.',
  },
  {
    key: 'recall',
    label: 'Sensitivity',
    clinicalInterpretation:
      'Of all patients who truly have the condition, how many did the model detect. High sensitivity means fewer missed diagnoses.',
  },
  {
    key: 'specificity',
    label: 'Specificity',
    clinicalInterpretation:
      'Of all healthy patients, how many were correctly identified as healthy. High specificity means fewer unnecessary treatments.',
  },
  {
    key: 'f1',
    label: 'F1-Score',
    clinicalInterpretation:
      'Harmonic mean of precision and sensitivity, balancing false alarms against missed diagnoses.',
  },
  {
    key: 'auc',
    label: 'AUC',
    clinicalInterpretation:
      'Area Under the ROC Curve, measuring overall ability to distinguish between patient classes across all thresholds.',
  },
];
