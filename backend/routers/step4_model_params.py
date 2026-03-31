# routers/step4_model_params.py
import numpy as np
from fastapi import APIRouter, HTTPException, Header
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix as sk_confusion_matrix,
    roc_auc_score, roc_curve as sk_roc_curve,
)

from services import session_store
from services.prep_service import prepare_data
from models.schemas import TrainRequest, TrainResponse, SVMParams, RandomForestParams

router = APIRouter(prefix="/api/step4", tags=["Step 4 - Model & Parameters"])

SUPPORTED_MODELS = {"svm", "random_forest"}


def _get_prepared_splits(session: dict):
    """Re-run prep pipeline using stored session data and return X/y splits."""
    df = session.get("df_raw")
    target_col = session.get("target_column")
    feature_cols = session.get("feature_columns")
    prep_request = session.get("prep_request")

    if df is None or not target_col or not feature_cols or prep_request is None:
        raise HTTPException(
            status_code=400,
            detail="Session data incomplete. Please complete Steps 2 and 3 first.",
        )

    result = prepare_data(df, target_col, feature_cols, prep_request)
    return result


def _train_svm(X_train, y_train, raw_params: dict):
    """
    US-011: SVM Kernel Selection Tuning.
    Validates params, builds model. When kernel='rbf', C and gamma are applied.
    When kernel='linear', gamma is ignored.
    """
    try:
        p = SVMParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid SVM params: {exc}")

    if p.kernel not in {"linear", "rbf"}:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid kernel '{p.kernel}'. Choose 'linear' or 'rbf'.",
        )

    if p.C <= 0:
        raise HTTPException(
            status_code=422,
            detail=f"C must be > 0 (got {p.C}).",
        )

    # US-011 AC: when kernel switches to RBF, complexity params (C, gamma) apply
    model_kwargs = {"kernel": p.kernel, "C": p.C, "probability": True}
    if p.kernel == "rbf":
        model_kwargs["gamma"] = p.gamma   # gamma only meaningful for RBF

    model = SVC(**model_kwargs)
    params_used = {k: v for k, v in model_kwargs.items() if k != "probability"}
    return model, params_used


def _train_random_forest(X_train, y_train, raw_params: dict):
    """
    US-012: Random Forest Tree Count Tuning.
    n_estimators drives the tree count; training uses that forest size.
    """
    try:
        p = RandomForestParams(**raw_params)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid Random Forest params: {exc}")

    if not (1 <= p.n_estimators <= 1000):
        raise HTTPException(
            status_code=422,
            detail=f"n_estimators must be between 1 and 1000 (got {p.n_estimators}).",
        )

    # US-012 AC: training initiates with the specified forest size
    model = RandomForestClassifier(
        n_estimators=p.n_estimators,
        max_depth=p.max_depth,
        random_state=p.random_state,
    )
    params_used = {
        "n_estimators": p.n_estimators,
        "max_depth": p.max_depth,
        "random_state": p.random_state,
    }
    return model, params_used


@router.post(
    "/train",
    response_model=TrainResponse,
    summary="Train a model with selected parameters (US-011, US-012)",
)
def train_model(
    request: TrainRequest,
    x_session_id: str = Header(...),
):
    """
    Trains the selected model using the prepared data from Step 3.

    **Gate**: Requires prep_complete = True (Step 3 must be finished first).

    Supported models:
    - `svm` — US-011: kernel (linear | rbf), C, gamma
    - `random_forest` — US-012: n_estimators (tree count), max_depth
    """
    session = session_store.get(x_session_id)

    # ── Gate check ────────────────────────────────────────────────────────────
    if not session.get("prep_complete", False):
        raise HTTPException(
            status_code=403,
            detail=(
                "Step 4 is locked. Please complete Data Preparation in Step 3 "
                "before training a model."
            ),
        )

    if request.model not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported model '{request.model}'. Choose from: {sorted(SUPPORTED_MODELS)}",
        )

    # ── Re-prepare data from session ──────────────────────────────────────────
    df = session.get("df_raw")
    target_col = session.get("target_column")
    feature_cols = session.get("feature_columns")
    prep_req = session.get("prep_request")

    if df is None or not target_col or not feature_cols or prep_req is None:
        raise HTTPException(
            status_code=400,
            detail="Session data incomplete. Please complete Steps 2 and 3 first.",
        )

    from services.prep_service import prepare_data as _prep
    prep_result = _prep(df, target_col, feature_cols, prep_req)

    # Rebuild X/y from prep result metadata — re-run to get actual arrays
    from services.train_service import get_splits
    X_train, X_test, y_train, y_test = get_splits(
        df, target_col, feature_cols, prep_req
    )

    # ── Validate target is categorical (classifiers cannot handle continuous) ─
    n_unique = len(np.unique(y_train))
    if n_unique > 20:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Target column '{target_col}' has {n_unique} unique values and "
                f"appears to be continuous. Classification models require a "
                f"categorical target. Please select a column with discrete "
                f"classes (e.g. Yes/No, 0/1) in Step 2."
            ),
        )

    # ── Build and train model ─────────────────────────────────────────────────
    if request.model == "svm":
        model, params_used = _train_svm(X_train, y_train, request.params)
    else:
        model, params_used = _train_random_forest(X_train, y_train, request.params)

    try:
        model.fit(X_train, y_train)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Training failed: {exc}")

    # ── Evaluate ──────────────────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    class_labels = [str(c) for c in sorted(np.unique(np.concatenate([y_train, y_test])))]
    is_binary = len(class_labels) == 2
    # Use pos_label for binary with string labels; weighted for multiclass
    avg = "binary" if is_binary else "weighted"
    pos_lbl = class_labels[-1] if is_binary else None  # sorted: last = positive ("Yes", "1", etc.)

    accuracy  = round(float(accuracy_score(y_test, y_pred)), 4)
    precision = round(float(precision_score(y_test, y_pred, average=avg, pos_label=pos_lbl, zero_division=0)), 4)
    recall    = round(float(recall_score(y_test, y_pred, average=avg, pos_label=pos_lbl, zero_division=0)), 4)
    f1        = round(float(f1_score(y_test, y_pred, average=avg, pos_label=pos_lbl, zero_division=0)), 4)
    cm        = sk_confusion_matrix(y_test, y_pred).tolist()

    # ── Specificity from confusion matrix ────────────────────────────────────
    specificity_val = None
    try:
        cm_arr = np.array(cm)
        if cm_arr.shape == (2, 2):
            tn, fp = cm_arr[0, 0], cm_arr[0, 1]
            specificity_val = round(float(tn / (tn + fp)), 4) if (tn + fp) > 0 else 0.0
        else:
            # Multiclass: weighted average specificity
            spec_sum, weight_sum = 0.0, 0.0
            for i in range(cm_arr.shape[0]):
                tp_i = cm_arr[i, i]
                fp_i = cm_arr[:, i].sum() - tp_i
                tn_i = cm_arr.sum() - cm_arr[i, :].sum() - cm_arr[:, i].sum() + tp_i
                fn_i = cm_arr[i, :].sum() - tp_i
                denom = tn_i + fp_i
                spec_i = tn_i / denom if denom > 0 else 0.0
                class_count = cm_arr[i, :].sum()
                spec_sum += spec_i * class_count
                weight_sum += class_count
            specificity_val = round(float(spec_sum / weight_sum), 4) if weight_sum > 0 else 0.0
    except Exception:
        specificity_val = None

    # ── AUC & ROC curve ──────────────────────────────────────────────────────
    auc_val = None
    roc_curve_data = None
    try:
        y_proba = model.predict_proba(X_test)
        if len(class_labels) == 2:
            auc_val = round(float(roc_auc_score(y_test, y_proba[:, 1])), 4)
            fpr, tpr, _ = sk_roc_curve(y_test, y_proba[:, 1])
            roc_curve_data = {
                "fpr": [round(float(v), 4) for v in fpr],
                "tpr": [round(float(v), 4) for v in tpr],
                "auc": auc_val,
            }
        else:
            auc_val = round(float(roc_auc_score(
                y_test, y_proba, multi_class="ovr", average="weighted"
            )), 4)
    except Exception:
        pass

    # ── Persist trained model for Step 5 ─────────────────────────────────────
    session_store.set(x_session_id, "trained_model", model)
    session_store.set(x_session_id, "model_name", request.model)
    session_store.set(x_session_id, "class_labels", class_labels)
    session_store.set(x_session_id, "X_test", X_test)
    session_store.set(x_session_id, "y_test", y_test)
    session_store.set(x_session_id, "train_complete", True)

    return TrainResponse(
        model=request.model,
        params_used=params_used,
        accuracy=accuracy,
        precision=precision,
        recall=recall,
        f1=f1,
        specificity=specificity_val,
        auc=auc_val,
        roc_curve=roc_curve_data,
        confusion_matrix=cm,
        class_labels=class_labels,
        message=(
            f"{request.model.replace('_', ' ').title()} trained successfully. "
            f"Accuracy: {accuracy * 100:.1f}%"
        ),
    )


@router.get(
    "/options",
    summary="Return available models and their configurable parameters",
)
def get_model_options():
    """
    Provides model list and parameter definitions for the Step 4 UI.
    Frontend renders controls dynamically from this response.
    """
    return {
        "models": [
            {
                "id": "svm",
                "label": "Support Vector Machine (SVM)",
                "params": [
                    {
                        "key": "kernel",
                        "label": "Kernel",
                        "type": "select",
                        "options": [
                            {"value": "linear", "label": "Linear"},
                            {"value": "rbf",    "label": "RBF (Radial Basis Function)"},
                        ],
                        "default": "linear",
                        # US-011: switching to RBF triggers C and gamma controls
                        "triggers_params": {"rbf": ["C", "gamma"]},
                    },
                    {
                        "key": "C",
                        "label": "Regularisation (C)",
                        "type": "slider",
                        "min": 0.01, "max": 100.0, "step": 0.01, "default": 1.0,
                        "visible_when": {"kernel": ["linear", "rbf"]},
                    },
                    {
                        "key": "gamma",
                        "label": "Gamma",
                        "type": "select",
                        "options": [
                            {"value": "scale", "label": "Scale (default)"},
                            {"value": "auto",  "label": "Auto"},
                        ],
                        "default": "scale",
                        "visible_when": {"kernel": ["rbf"]},  # only shown for RBF
                    },
                ],
            },
            {
                "id": "random_forest",
                "label": "Random Forest",
                "params": [
                    {
                        "key": "n_estimators",
                        "label": "Number of Trees",
                        "type": "slider",
                        "min": 10, "max": 500, "step": 10, "default": 100,
                        # US-012: adjusting this slider drives the forest size
                    },
                    {
                        "key": "max_depth",
                        "label": "Max Tree Depth",
                        "type": "slider",
                        "min": 1, "max": 50, "step": 1, "default": None,
                        "nullable": True,
                    },
                    {
                        "key": "random_state",
                        "label": "Random State (seed)",
                        "type": "number",
                        "default": 42,
                    },
                ],
            },
        ]
    }
