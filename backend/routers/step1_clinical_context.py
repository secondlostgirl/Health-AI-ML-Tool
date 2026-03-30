# routers/step1_clinical_context.py
from fastapi import APIRouter, HTTPException
from data.clinical_contexts import CLINICAL_CONTEXTS, DOMAIN_LIST
from models.schemas import ClinicalContextResponse

router = APIRouter(prefix="/api/step1", tags=["Step 1 - Clinical Context"])


@router.get("/domains", summary="List all 20 available clinical domains")
def list_domains():
    """Returns a list of all domain keys for the domain selector dropdown."""
    return {"domains": DOMAIN_LIST, "count": len(DOMAIN_LIST)}


@router.get(
    "/context/{domain}",
    response_model=ClinicalContextResponse,
    summary="Get clinical context for a specific domain",
)
def get_clinical_context(domain: str):
    """
    Returns the full clinical context for the chosen specialty.
    Used to populate the Step 1 reading panel.
    """
    domain = domain.lower().strip()
    if domain not in CLINICAL_CONTEXTS:
        raise HTTPException(
            status_code=404,
            detail=f"Domain '{domain}' not found. Valid domains: {DOMAIN_LIST}",
        )
    return CLINICAL_CONTEXTS[domain]
