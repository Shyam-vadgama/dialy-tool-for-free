from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import json
from backend.services.app_generator import create_app_bundle

router = APIRouter()

@router.post("/web-to-app/generate")
async def generate_app(
    name: str = Form(...),
    url: str = Form(...),
    description: str = Form(""),
    theme_color: str = Form("#ffffff"),
    platforms: str = Form(...), # JSON string list of platforms
    icon: UploadFile = File(...)
):
    try:
        # Parse platforms
        try:
            platform_list = json.loads(platforms)
        except:
            platform_list = ["pwa", "electron"] # default

        icon_content = await icon.read()
        
        zip_buffer = create_app_bundle(
            name=name,
            url=url,
            description=description,
            theme_color=theme_color,
            icon_bytes=icon_content,
            platforms=platform_list
        )
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={name}_app_bundle.zip"}
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
