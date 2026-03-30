# routers/step2_data_exploration.py
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from typing import Optional

from services import session_store
from services.csv_service import parse_and_validate_csv, build_column_info
from models.schemas import DatasetSummary, ColumnMapping, ColumnMappingResponse

router = APIRouter(prefix="/api/step2", tags=["Step 2 - Data Exploration"])


# ── Upload endpoint ───────────────────────────────────────────────────────────

@router.post(
    "/upload",
    response_model=DatasetSummary,
    summary="Upload a CSV dataset",
)
async def upload_csv(
    file: UploadFile = File(...),
    x_session_id: Optional[str] = Header(None),
):
    """
    Accepts a CSV file, validates it, stores the DataFrame in session,
    and returns column statistics for the Data Exploration panel.

    Send header: X-Session-Id: <your-uuid>
    If omitted a new session ID is created and returned in the response header.
    """
    session_id = x_session_id or str(uuid.uuid4())

    df, filename = await parse_and_validate_csv(file)

    # Store raw DataFrame in session
    session_store.set(session_id, "df_raw", df)
    session_store.set(session_id, "filename", filename)
    session_store.set(session_id, "schema_ok", False)  # reset gate

    columns = build_column_info(df)

    response = DatasetSummary(
        filename=filename,
        row_count=len(df),
        column_count=len(df.columns),
        columns=columns,
        schema_ok=False,
    )

    # Return session ID in a custom header so the frontend can store it
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content=response.model_dump(),
        headers={"X-Session-Id": session_id},
    )


# ── Column mapper save endpoint ───────────────────────────────────────────────

@router.post(
    "/column-mapping",
    response_model=ColumnMappingResponse,
    summary="Save column mapping and open the Step 3 gate",
)
def save_column_mapping(
    mapping: ColumnMapping,
    x_session_id: str = Header(...),
):
    """
    Called when the user clicks Save in the Column Mapper Modal.
    Validates the mapping against the uploaded DataFrame, then sets
    schema_ok = True, which allows the frontend to navigate to Step 3.
    """
    session = session_store.get(x_session_id)
    df: pd.DataFrame | None = session.get("df_raw")

    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset found for this session. Please upload a CSV file first.",
        )

    all_cols = list(df.columns)

    # Validate target column
    if mapping.target_column not in all_cols:
        raise HTTPException(
            status_code=422,
            detail=f"Target column '{mapping.target_column}' not found in dataset. Available: {all_cols}",
        )

    # Validate feature columns
    invalid = [c for c in mapping.feature_columns if c not in all_cols]
    if invalid:
        raise HTTPException(
            status_code=422,
            detail=f"Feature column(s) not found in dataset: {invalid}",
        )

    if not mapping.feature_columns:
        raise HTTPException(
            status_code=422,
            detail="At least one feature column must be selected.",
        )

    if mapping.target_column in mapping.feature_columns:
        raise HTTPException(
            status_code=422,
            detail="Target column cannot also be a feature column.",
        )

    # Compute class distribution
    target_series = df[mapping.target_column].astype(str)
    class_distribution = target_series.value_counts().to_dict()

    # Persist mapping and open the gate
    session_store.set(x_session_id, "target_column", mapping.target_column)
    session_store.set(x_session_id, "feature_columns", mapping.feature_columns)
    session_store.set(x_session_id, "schema_ok", True)

    return ColumnMappingResponse(
        schema_ok=True,
        message="Column mapping saved. You can now proceed to Step 3: Data Preparation.",
        mapped_target=mapping.target_column,
        mapped_features=mapping.feature_columns,
        class_distribution=class_distribution,
    )


# ── Gate check endpoint ───────────────────────────────────────────────────────

@router.get(
    "/schema-status",
    summary="Check whether the column mapper has been saved (Step 3 gate)",
)
def check_schema_status(x_session_id: str = Header(...)):
    """
    Returns schema_ok flag. Frontend polls this (or uses the response from
    /column-mapping) to decide whether to show a red blocked banner on Step 3.
    """
    schema_ok = session_store.get(x_session_id).get("schema_ok", False)
    return {
        "schema_ok": schema_ok,
        "message": (
            "Column mapping complete. Step 3 is unlocked."
            if schema_ok
            else "Please complete the Column Mapper before proceeding to Step 3."
        ),
    }
