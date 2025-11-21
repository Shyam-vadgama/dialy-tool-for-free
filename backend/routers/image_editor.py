from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import io
from backend.services.image_processing import apply_image_operation

router = APIRouter()

@router.post("/image/edit")
async def edit_image(file: UploadFile = File(...), operation: str = Form(...)):
    try:
        image_content = await file.read()
        processed_image_content = apply_image_operation(image_content, operation)
        
        # Determine content type based on the processed image (or assume original for simplicity)
        content_type = file.content_type if file.content_type else "image/png"

        return StreamingResponse(processed_image_content, media_type=content_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")