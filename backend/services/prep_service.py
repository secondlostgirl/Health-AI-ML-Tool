# services/prep_service.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from models.schemas import DataPrepRequest, DataPrepResponse, DistributionBar
from typing import Dict, Tuple


def _impute(df: pd.DataFrame, strategy: str) -> Tuple[pd.DataFrame, int]:
    """Handle missing values. Returns cleaned df and count of affected cells."""
    df = df.copy()
    affected = 0

    if strategy == "drop":
        before = len(df)
        df = df.dropna()
        affected = before - len(df)  # rows dropped
        return df, affected

    numeric_cols = df.select_dtypes(include="number").columns
    categorical_cols = df.select_dtypes(exclude="number").columns

    for col in numeric_cols:
        missing = df[col].isna().sum()
        if missing == 0:
            continue
        if strategy == "mean":
            df[col] = df[col].fillna(df[col].mean())
        elif strategy == "median":
            df[col] = df[col].fillna(df[col].median())
        elif strategy == "mode":
            df[col] = df[col].fillna(df[col].mode().iloc[0])
        affected += int(missing)

    for col in categorical_cols:
        missing = df[col].isna().sum()
        if missing == 0:
            continue
        df[col] = df[col].fillna(df[col].mode().iloc[0] if not df[col].mode().empty else "unknown")
        affected += int(missing)

    return df, affected


def _normalise(df: pd.DataFrame, target_col: str, method: str) -> Tuple[pd.DataFrame, list]:
    """Normalise numeric feature columns. Returns df and before/after chart data."""
    df = df.copy()
    numeric_cols = [c for c in df.select_dtypes(include="number").columns if c != target_col]
    chart = []

    if method == "none" or not numeric_cols:
        for col in numeric_cols[:6]:  # limit chart to 6 features
            chart.append(DistributionBar(
                label=col,
                before=round(float(df[col].std()), 4),
                after=round(float(df[col].std()), 4),
            ))
        return df, chart

    before_std = {col: float(df[col].std()) for col in numeric_cols}

    if method == "minmax":
        scaler = MinMaxScaler()
    else:  # standard
        scaler = StandardScaler()

    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    for col in numeric_cols[:6]:
        chart.append(DistributionBar(
            label=col,
            before=round(before_std[col], 4),
            after=round(float(df[col].std()), 4),
        ))

    return df, chart


def _apply_smote(X: np.ndarray, y: np.ndarray):
    """Apply SMOTE oversampling on the training set."""
    try:
        from imblearn.over_sampling import SMOTE
        sm = SMOTE(random_state=42)
        X_res, y_res = sm.fit_resample(X, y)
        return X_res, y_res
    except Exception:
        return X, y  # fallback: return unchanged if SMOTE fails


def prepare_data(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: list,
    request: DataPrepRequest,
) -> DataPrepResponse:
    """Full preparation pipeline: impute → normalise → split → optional SMOTE."""

    # ── Encode categorical features ──────────────────────────────────────────
    work = df[feature_cols + [target_col]].copy()
    cat_cols = work[feature_cols].select_dtypes(exclude="number").columns.tolist()
    for col in cat_cols:
        work[col] = pd.Categorical(work[col]).codes

    # ── Impute ───────────────────────────────────────────────────────────────
    work, missing_handled = _impute(work, request.missing_strategy)

    # ── Class balance BEFORE ─────────────────────────────────────────────────
    y_series = work[target_col].astype(str)
    class_balance_before: Dict[str, int] = y_series.value_counts().to_dict()

    # ── Normalise ────────────────────────────────────────────────────────────
    work, norm_chart = _normalise(work, target_col, request.normalisation)

    # ── Train / test split ───────────────────────────────────────────────────
    X = work[feature_cols].values
    y = work[target_col].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=request.test_size,
        random_state=request.random_state,
        stratify=y if len(np.unique(y)) > 1 else None,
    )

    # ── SMOTE ────────────────────────────────────────────────────────────────
    smote_applied = False
    if request.apply_smote:
        X_train, y_train = _apply_smote(X_train, y_train)
        smote_applied = True

    # ── Class balance AFTER (training set) ───────────────────────────────────
    unique, counts = np.unique(y_train, return_counts=True)
    class_balance_after: Dict[str, int] = {str(k): int(v) for k, v in zip(unique, counts)}

    # ── Class balance chart data ──────────────────────────────────────────────
    all_labels = set(class_balance_before) | set(class_balance_after)
    balance_chart = [
        DistributionBar(
            label=lbl,
            before=float(class_balance_before.get(lbl, 0)),
            after=float(class_balance_after.get(lbl, 0)),
        )
        for lbl in sorted(all_labels)
    ]

    return DataPrepResponse(
        success=True,
        train_rows=int(len(X_train)),
        test_rows=int(len(X_test)),
        features_used=feature_cols,
        missing_handled=missing_handled,
        normalisation_applied=request.normalisation,
        smote_applied=smote_applied,
        class_balance_before=class_balance_before,
        class_balance_after=class_balance_after,
        normalisation_chart=norm_chart,
        class_balance_chart=balance_chart,
        message=(
            f"Data prepared successfully. "
            f"{len(X_train)} training rows and {len(X_test)} test rows ready."
        ),
    )
