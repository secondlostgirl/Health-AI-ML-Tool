# services/train_service.py
"""
Provides get_splits() — re-runs the same prep pipeline as Step 3
but returns raw numpy arrays instead of the DataPrepResponse schema.
Used by Step 4 to obtain X_train, X_test, y_train, y_test.
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from models.schemas import DataPrepRequest


def get_splits(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: list,
    request: DataPrepRequest,
):
    """
    Mirrors the prep pipeline in prep_service.prepare_data but returns
    (X_train, X_test, y_train, y_test) as numpy arrays for model training.
    """
    work = df[feature_cols + [target_col]].copy()

    # Encode categoricals
    cat_cols = work[feature_cols].select_dtypes(exclude="number").columns.tolist()
    for col in cat_cols:
        work[col] = pd.Categorical(work[col]).codes

    # Impute missing values
    if request.missing_strategy == "drop":
        work = work.dropna()
    else:
        numeric_cols = work.select_dtypes(include="number").columns
        for col in numeric_cols:
            if work[col].isna().sum() == 0:
                continue
            if request.missing_strategy == "mean":
                work[col] = work[col].fillna(work[col].mean())
            elif request.missing_strategy == "median":
                work[col] = work[col].fillna(work[col].median())
            elif request.missing_strategy == "mode":
                work[col] = work[col].fillna(work[col].mode().iloc[0])

        cat_cols_remaining = work.select_dtypes(exclude="number").columns
        for col in cat_cols_remaining:
            if work[col].isna().sum() > 0:
                mode = work[col].mode()
                work[col] = work[col].fillna(mode.iloc[0] if not mode.empty else "unknown")

    # Normalise
    numeric_feature_cols = [
        c for c in work[feature_cols].select_dtypes(include="number").columns
    ]
    if request.normalisation == "minmax" and numeric_feature_cols:
        scaler = MinMaxScaler()
        work[numeric_feature_cols] = scaler.fit_transform(work[numeric_feature_cols])
    elif request.normalisation == "standard" and numeric_feature_cols:
        scaler = StandardScaler()
        work[numeric_feature_cols] = scaler.fit_transform(work[numeric_feature_cols])

    # Split
    X = work[feature_cols].values
    y = work[target_col].values

    unique_classes, class_counts = np.unique(y, return_counts=True)
    can_stratify = len(unique_classes) > 1 and all(c >= 2 for c in class_counts)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=request.test_size,
        random_state=request.random_state,
        stratify=y if can_stratify else None,
    )

    # SMOTE (training set only)
    if request.apply_smote:
        try:
            from imblearn.over_sampling import SMOTE
            sm = SMOTE(random_state=42)
            X_train, y_train = sm.fit_resample(X_train, y_train)
        except Exception:
            pass

    return X_train, X_test, y_train, y_test
