# services/csv_service.py
import io
import pandas as pd
from fastapi import UploadFile, HTTPException
from typing import Tuple

ALLOWED_EXTENSIONS = {".csv"}
MAX_FILE_SIZE_MB = 50
MAX_ROWS = 100_000
MIN_ROWS = 10
MIN_COLS = 2


async def parse_and_validate_csv(file: UploadFile) -> Tuple[pd.DataFrame, str]:
    """
    Read, validate, and return a DataFrame plus a friendly error message.
    Raises HTTPException with status 422 on validation failure.
    """
    filename = file.filename or "upload.csv"

    # ── Extension check ───────────────────────────────────────────────────────
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid file type. Only .csv files are accepted (got '{filename}')."
        )

    # ── Read raw bytes ────────────────────────────────────────────────────────
    raw = await file.read()

    # ── Size check ────────────────────────────────────────────────────────────
    size_mb = len(raw) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=422,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        )

    # ── Parse CSV ─────────────────────────────────────────────────────────────
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse CSV file. Make sure it is valid UTF-8 comma-separated text. Details: {exc}"
        )

    # ── Empty / too small ─────────────────────────────────────────────────────
    if df.empty or len(df) < MIN_ROWS:
        raise HTTPException(
            status_code=422,
            detail=f"Dataset has only {len(df)} rows. At least {MIN_ROWS} rows are required."
        )

    if len(df.columns) < MIN_COLS:
        raise HTTPException(
            status_code=422,
            detail=f"Dataset has only {len(df.columns)} column(s). At least {MIN_COLS} columns are required."
        )

    # ── Row cap ───────────────────────────────────────────────────────────────
    if len(df) > MAX_ROWS:
        df = df.head(MAX_ROWS)

    return df, filename


def build_column_info(df: pd.DataFrame) -> list:
    """Return per-column statistics for the Data Exploration panel."""
    cols = []
    for col in df.columns:
        series = df[col]
        missing = int(series.isna().sum())
        cols.append({
            "name": col,
            "dtype": str(series.dtype),
            "missing_count": missing,
            "missing_pct": round(missing / len(df) * 100, 2),
            "unique_count": int(series.nunique()),
            "sample_values": series.dropna().head(5).tolist(),
        })
    return cols
