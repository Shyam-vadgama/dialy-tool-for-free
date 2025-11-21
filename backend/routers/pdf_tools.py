from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from backend.services.pdf_processing import merge_pdfs, extract_pages
from typing import List

router = APIRouter(
    prefix="/pdf",
    tags=["pdf"]
)

@router.post("/merge")
async def merge_pdfs_endpoint(files: List[UploadFile] = File(...)):
    """
    Merge multiple uploaded PDF files into one.
    """
    try:
        file_contents = []
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
            content = await file.read()
            file_contents.append(content)
            
        merged_pdf = merge_pdfs(file_contents)
        
        return StreamingResponse(
            merged_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/extract")
async def extract_pages_endpoint(
    file: UploadFile = File(...),
    pages: str = Form(...)
):
    """
    Extract pages from a PDF.
    pages: string like "1,3-5"
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
        
    try:
        content = await file.read()
        extracted_pdf = extract_pages(content, pages)
        
        return StreamingResponse(
            extracted_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=extracted.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
