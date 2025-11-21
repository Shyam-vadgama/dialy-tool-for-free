from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import io
from backend.services.pdf_processing import rotate_pdf_pages

router = APIRouter()

@router.post("/pdf/edit")
async def edit_pdf(file: UploadFile = File(...), operation: str = Form(...)):
    try:
        pdf_content = await file.read()
        
        processed_pdf_content = None
        if operation == "rotate_all_90_clockwise":
            processed_pdf_content = rotate_pdf_pages(pdf_content, 90)
        else:
            raise ValueError(f"Unsupported PDF operation: {operation}")

        content_type = file.content_type if file.content_type else "application/pdf"

        return StreamingResponse(processed_pdf_content, media_type=content_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")