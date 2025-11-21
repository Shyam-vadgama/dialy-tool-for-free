from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import yt_dlp
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import tempfile
import os
from pathlib import Path

# Download manager models
class BasicDownloadRequest(BaseModel):
    url: str
    format: str = "best"  # video format preference

class AdvancedScrapeRequest(BaseModel):
    url: str
    asset_types: List[str] = ["images", "videos", "audio", "fonts", "documents"]

class AssetResponse(BaseModel):
    category: str
    url: str
    filename: str
    size: Optional[int] = None

# Download manager configuration
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

ASSET_EXTENSIONS = {
    "images": [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", ".bmp"],
    "videos": [".mp4", ".webm", ".mkv", ".mov", ".avi"],
    "audio": [".mp3", ".wav", ".ogg", ".flac"],
    "fonts": [".ttf", ".otf", ".woff", ".woff2"],
    "documents": [".pdf", ".doc", ".docx", ".zip", ".txt"]
}

# Thread pool for download operations
executor = ThreadPoolExecutor(max_workers=4)

def get_asset_category(url: str) -> str:
    """Determine asset category based on URL extension"""
    path = urlparse(url).path.lower()
    for category, exts in ASSET_EXTENSIONS.items():
        if any(path.endswith(ext) for ext in exts):
            return category
    return "others"

app = FastAPI(
    title="All-in-One Tools Platform API",
    description="Backend API for the All-in-One Tools Platform",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the All-in-One Tools Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Download Manager API Endpoints

@app.post("/api/download/basic")
async def basic_download(request: BasicDownloadRequest):
    """Basic video download using yt-dlp"""
    try:
        # yt-dlp configuration for basic video download
        ydl_opts = {
            'format': request.format,
            'extract_flat': False,
            'writeinfojson': True,
            'writethumbnail': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract info without downloading
            info = ydl.extract_info(request.url, download=False)
            
            # Get available formats
            formats = []
            if 'formats' in info:
                for f in info['formats']:
                    if f.get('vcodec') != 'none':  # Has video
                        formats.append({
                            'format_id': f.get('format_id'),
                            'ext': f.get('ext'),
                            'quality': f.get('format_note'),
                            'filesize': f.get('filesize'),
                            'url': f.get('url')
                        })
            
            return {
                'status': 'success',
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration'),
                'thumbnail': info.get('thumbnail'),
                'formats': formats[:10],  # Limit to first 10 formats
                'original_url': request.url
            }
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process video: {str(e)}")

@app.post("/api/download/advanced-scrape")
async def advanced_scrape(request: AdvancedScrapeRequest):
    """Advanced website scraping to find all assets"""
    try:
        url = request.url
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        # Initialize assets dictionary
        assets = {category: set() for category in ASSET_EXTENSIONS.keys()}
        assets['others'] = set()
        
        # Make request to the website
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Find images from img tags and meta tags
        for tag in soup.find_all(['img', 'link']):
            src = tag.get('src') or tag.get('href')
            if src:
                full_url = urljoin(url, src)
                category = get_asset_category(full_url)
                
                # Special handling for images
                if (tag.name == 'img' or 
                    'icon' in tag.get('rel', []) or 
                    'image' in str(tag) or 
                    category == 'images'):
                    assets['images'].add(full_url)
                elif category != 'others':
                    assets[category].add(full_url)
                else:
                    assets['others'].add(full_url)
        
        # 2. Find videos and audio
        for tag in soup.find_all(['video', 'audio', 'source']):
            src = tag.get('src')
            if src:
                full_url = urljoin(url, src)
                category = get_asset_category(full_url)
                
                if category == 'others':
                    if tag.name == 'video':
                        category = 'videos'
                    elif tag.name == 'audio':
                        category = 'audio'
                        
                assets[category].add(full_url)
        
        # 3. Find CSS background images
        for tag in soup.find_all(attrs={"style": True}):
            style = tag['style']
            urls = re.findall(r'url\((?:[\'"]?)(.*?)(?:[\'"]?)\)', style)
            for u in urls:
                full_url = urljoin(url, u)
                if get_asset_category(full_url) == 'images':
                    assets['images'].add(full_url)
        
        # 4. Find CSS files and extract URLs from them
        for tag in soup.find_all('link', {'rel': 'stylesheet'}):
            css_url = tag.get('href')
            if css_url:
                try:
                    css_full_url = urljoin(url, css_url)
                    css_response = requests.get(css_full_url, headers=HEADERS, timeout=5)
                    css_urls = re.findall(r'url\((?:[\'\"]?)(.*?)(?:[\'\"]?)\)', css_response.text)
                    for u in css_urls:
                        full_url = urljoin(css_full_url, u)
                        category = get_asset_category(full_url)
                        if category != 'others':
                            assets[category].add(full_url)
                except:
                    continue
        
        # Convert sets to lists and add metadata
        result = {}
        for category, urls in assets.items():
            if category in request.asset_types:
                result[category] = []
                for asset_url in list(urls)[:50]:  # Limit to 50 per category
                    try:
                        filename = os.path.basename(urlparse(asset_url).path) or f"asset.{category[:-1]}"
                        result[category].append({
                            'url': asset_url,
                            'filename': filename,
                            'category': category
                        })
                    except:
                        continue
        
        return {
            'status': 'success',
            'source_url': url,
            'assets': result,
            'total_found': sum(len(assets) for assets in result.values())
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape website: {str(e)}")

@app.get("/api/download/proxy")
async def download_proxy(url: str, filename: str = None):
    """Proxy download endpoint to handle CORS issues"""
    try:
        response = requests.get(url, headers=HEADERS, stream=True)
        response.raise_for_status()
        
        # Determine content type and filename
        content_type = response.headers.get('content-type', 'application/octet-stream')
        if not filename:
            filename = os.path.basename(urlparse(url).path) or 'download'
            
        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                yield chunk
        
        return StreamingResponse(
            generate(),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")

# Include Routers
from backend.routers import converters, pdf_tools, image_editor, pdf_editor, security
app.include_router(converters.router)
app.include_router(pdf_tools.router)
app.include_router(image_editor.router)
app.include_router(pdf_editor.router)
app.include_router(security.router)


