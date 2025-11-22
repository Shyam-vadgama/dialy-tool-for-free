from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
import socket
import requests
from urllib.parse import urlparse

router = APIRouter(
    prefix="/security",
    tags=["security"]
)

# Shakki words ki list
SUSPICIOUS_KEYWORDS = ['login', 'signin', 'verify', 'update', 'bank', 'secure', 'account', 'free', 'bonus', 'paypal-confirm']

def is_ip_address(domain):
    """Check karta hai ki domain ek IP address hai ya nahi"""
    try:
        socket.inet_aton(domain)
        return True
    except socket.error:
        return False

def analyze_url(url):
    score = 0
    reasons = []
    
    # 1. Protocol Check
    parsed = urlparse(url)
    if parsed.scheme != 'https':
        score += 20
        reasons.append("Not using HTTPS (Insecure connection)")

    domain = parsed.netloc
    
    # 2. IP Address Check (Bada Red Flag)
    if is_ip_address(domain):
        score += 50
        reasons.append("URL uses an IP address instead of a domain name")

    # 3. The '@' Trick
    if '@' in url:
        score += 60
        reasons.append("URL contains '@' symbol (Redirect trick)")

    # 4. Lengthy Domain
    if len(domain) > 30:
        score += 10
        reasons.append("Domain name is suspiciously long")

    # 5. Keyword Check
    for word in SUSPICIOUS_KEYWORDS:
        if word in domain or word in parsed.path:
            if 'google' not in domain and 'facebook' not in domain and 'amazon' not in domain:
                score += 15
                reasons.append(f"Suspicious keyword found: '{word}'")
                break

    # 6. Redirect Check
    try:
        response = requests.head(url, headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, timeout=5)
        
        final_url = response.url
        if final_url != url:
            reasons.append(f"Redirects to: {final_url}")
            
            if urlparse(final_url).netloc != domain:
                score += 10
        
        if response.status_code >= 400:
            reasons.append(f"Website returned status code {response.status_code}")
            
    except Exception as e:
        score += 10
        reasons.append(f"Could not reach the website: {str(e)}")

    # FINAL DECISION
    if score >= 50:
        status = "DANGER"
    elif score >= 20:
        status = "WARNING"
    else:
        status = "SAFE"

    return status, score, reasons

class UrlScanRequest(BaseModel):
    url: str

@router.post("/scan-url")
async def scan_url_endpoint(request: UrlScanRequest):
    url_input = request.url
    if not url_input.startswith(('http://', 'https://')):
        url_input = 'http://' + url_input
    
    try:
        status, score, reasons = analyze_url(url_input)
        
        return {
            'status': status,
            'score': score,
            'reasons': reasons,
            'url': url_input
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))