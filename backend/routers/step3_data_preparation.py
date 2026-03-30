# routers/step3_data_preparation.py
import pandas as pd
from fastapi import APIRouter, HTTPException, Header

from services import session_store
from services.prep_service import prepare_data
from models.schemas import DataPrepRequest, DataPrepResponse

router = APIRouter(prefix="/api/step3", tags=["Step 3 - Data Preparation"])


@router.post(
    "/prepare",
    response_model=DataPrepResponse,
    summary="Run the full data preparation pipeline",
)
def prepare(
    request: DataPrepRequest,
    x_session_id: str = Header(...),
):
    """
    Applies missing-value handling, normalisation, train/test split,
    and optionally SMOTE to the uploaded dataset.

    **Gate**: Requires schema_ok = True (column mapper must be saved first).
    Returns before/after chart data for normalisation bars and class balance bars.
    """
    session = session_store.get(x_session_id)

    # ── Gate check ────────────────────────────────────────────────────────────
    if not session.get("schema_ok", False):
        raise HTTPException(
            status_code=403,
            detail=(
                "Step 3 is locked. Please complete the Column Mapper in Step 2 "
                "before running data preparation."
            ),
        )

    df: pd.DataFrame | None = session.get("df_raw")
    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset found. Please upload a CSV file in Step 2.",
        )

    target_col: str | None = session.get("target_column")
    feature_cols: list | None = session.get("feature_columns")

    if not target_col or not feature_cols:
        raise HTTPException(
            status_code=400,
            detail="Column mapping is missing. Please complete the Column Mapper in Step 2.",
        )

    # ── Validate prep parameters ──────────────────────────────────────────────
    valid_missing = {"mean", "median", "mode", "drop"}
    if request.missing_strategy not in valid_missing:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid missing_strategy '{request.missing_strategy}'. Choose from: {valid_missing}",
        )

    valid_norm = {"minmax", "standard", "none"}
    if request.normalisation not in valid_norm:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid normalisation '{request.normalisation}'. Choose from: {valid_norm}",
        )

    if not (0.1 <= request.test_size <= 0.4):
        raise HTTPException(
            status_code=422,
            detail=f"test_size must be between 0.1 and 0.4 (got {request.test_size}).",
        )

    # ── Run preparation ───────────────────────────────────────────────────────
    try:
        result = prepare_data(df, target_col, feature_cols, request)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Data preparation failed: {exc}",
        )

    # Persist prep settings so Step 4 can use the processed splits
    session_store.set(x_session_id, "prep_request", request)
    session_store.set(x_session_id, "prep_complete", True)

    return result


@router.get(
    "/options",
    summary="Return available options for each Step 3 control",
)
def get_options():
    """
    Provides the dropdown / slider options for the Step 3 UI.
    The frontend renders these dynamically so no hardcoding is needed.
    """
    return {
        "missing_strategies": [
            {"value": "mean",   "label": "Replace with Mean"},
            {"value": "median", "label": "Replace with Median"},
            {"value": "mode",   "label": "Replace with Mode"},
            {"value": "drop",   "label": "Drop Rows with Missing Values"},
        ],
        "normalisation_methods": [
            {"value": "minmax",   "label": "Min-Max (scale to 0–1)"},
            {"value": "standard", "label": "Standard (Z-score, mean=0)"},
            {"value": "none",     "label": "No Normalisation"},
        ],
        "test_size_range": {"min": 0.1, "max": 0.4, "step": 0.05, "default": 0.2},
        "smote": {"label": "Apply SMOTE (balance classes)", "default": False},
    }
