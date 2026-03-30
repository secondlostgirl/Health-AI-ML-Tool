# routers/step4_model_params.py
import numpy as np
from fastapi import APIRouter, HTTPException, Header
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix,
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
    avg = "binary" if len(class_labels) == 2 else "weighted"

    accuracy  = round(float(accuracy_score(y_test, y_pred)), 4)
    precision = round(float(precision_score(y_test, y_pred, average=avg, zero_division=0)), 4)
    recall    = round(float(recall_score(y_test, y_pred, average=avg, zero_division=0)), 4)
    f1        = round(float(f1_score(y_test, y_pred, average=avg, zero_division=0)), 4)
    cm        = confusion_matrix(y_test, y_pred).tolist()

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
