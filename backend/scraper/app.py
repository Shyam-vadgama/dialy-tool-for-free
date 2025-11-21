from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

app = Flask(__name__)

# Browser ko mimic karne ke liye headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Extension based categorization
ASSET_EXTENSIONS = {
    "images": ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'],
    "videos": ['.mp4', '.webm', '.mkv', '.mov', '.avi'],
    "audio": ['.mp3', '.wav', '.ogg', '.flac'],
    "fonts": ['.ttf', '.otf', '.woff', '.woff2'],
    "documents": ['.pdf', '.doc', '.docx', '.zip']
}

def get_category(url):
    """URL dekh kar batayega ki yeh Image hai ya Video"""
    path = urlparse(url).path.lower()
    for category, exts in ASSET_EXTENSIONS.items():
        if any(path.endswith(ext) for ext in exts):
            return category
    return "others"

@app.route('/', methods=['GET', 'POST'])
def home():
    assets = {
        "images": set(),
        "videos": set(),
        "audio": set(),
        "fonts": set(),
        "documents": set(),
        "others": set()
    }
    
    target_url = ""
    error = None

    if request.method == 'POST':
        target_url = request.form.get('url')
        
        if not target_url.startswith(('http://', 'https://')):
            target_url = 'https://' + target_url

        try:
            # Request bhejo
            response = requests.get(target_url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')

            # --- SCAPING LOGIC (Only Links, No Download) ---

            # 1. Images (img, icons, meta og:image)
            for tag in soup.find_all(['img', 'link']):
                src = tag.get('src') or tag.get('href')
                if src:
                    full_url = urljoin(target_url, src)
                    # Category filter
                    cat = get_category(full_url)
                    # Images ke liye special check
                    if tag.name == 'img' or 'icon' in tag.get('rel', []) or 'image' in str(tag):
                        assets['images'].add(full_url)
                    elif cat != 'others':
                        assets[cat].add(full_url)

            # 2. Videos & Audio
            for tag in soup.find_all(['video', 'audio', 'source']):
                src = tag.get('src')
                if src:
                    full_url = urljoin(target_url, src)
                    cat = get_category(full_url)
                    # Agar category unidentified hai par tag video hai, toh video mein daalo
                    if cat == 'others':
                        if tag.name == 'video': cat = 'videos'
                        elif tag.name == 'audio': cat = 'audio'
                    assets[cat].add(full_url)

            # 3. Background Images from Inline CSS (Advanced)
            # Inline styles se url('...') nikalna
            for tag in soup.find_all(attrs={"style": True}):
                style = tag['style']
                urls = re.findall(r'url\((?:[\'"]?)(.*?)(?:[\'"]?)\)', style)
                for u in urls:
                    full_url = urljoin(target_url, u)
                    if get_category(full_url) == 'images':
                        assets['images'].add(full_url)

        except Exception as e:
            error = f"Bhai, kuch gadbad hui: {str(e)}"

    return render_template('index.html', assets=assets, url=target_url, error=error)

if __name__ == '__main__':
    # Debug mode on hai taaki changes turant dikhe
    app.run(debug=True)