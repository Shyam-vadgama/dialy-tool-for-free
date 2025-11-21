from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from backend.services.image_processing import convert_image
import io

router = APIRouter(
    prefix="/converters",
    tags=["converters"]
)

@router.post("/image")
async def convert_image_endpoint(
    file: UploadFile = File(...),
    format: str = Form(...)
):
    """
    Convert an uploaded image to the specified format (PNG, JPEG, WEBP, etc.)
    """
    supported_formats = ["PNG", "JPEG", "JPG", "WEBP", "BMP", "ICO"]
    
    if format.upper() not in supported_formats:
        raise HTTPException(status_code=400, detail=f"Unsupported format. Supported: {supported_formats}")
    
    try:
        content = await file.read()
        converted_image = convert_image(content, format)
        
        media_type = f"image/{format.lower()}"
        if format.upper() == "JPG":
            media_type = "image/jpeg"
            
        return StreamingResponse(
            converted_image, 
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename=converted.{format.lower()}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during conversion")
