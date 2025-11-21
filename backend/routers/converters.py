from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from backend.services.image_processing import convert_image
import io
from enum import Enum

router = APIRouter(
    prefix="/converters",
    tags=["converters"]
)

class ImageFormat(str, Enum):
    png = "png"
    jpeg = "jpeg"
    jpg = "jpg"
    webp = "webp"
    bmp = "bmp"
    ico = "ico"

@router.post("/image")
async def convert_image_endpoint(
    file: UploadFile = File(...),
    format: ImageFormat = Form(...)
):
    """
    Convert an uploaded image to the specified format (PNG, JPEG, WEBP, etc.)
    """
    try:
        content = await file.read()
        converted_image_io = convert_image(content, format.value)
        
        media_type = f"image/{format.value.lower()}"
        if format.value.upper() == "JPG":
            media_type = "image/jpeg"
            
        return StreamingResponse(
            converted_image_io, 
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename=converted.{format.value.lower()}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during conversion")
