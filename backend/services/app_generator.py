import io
import zipfile
import json
from PIL import Image
import os
import tempfile
import shutil
import subprocess
from pathlib import Path

def generate_electron_files(name, url, description):
    """Generate content for Electron project files."""
    safe_name = "".join(x for x in name.lower() if x.isalnum() or x == "-").replace(" ", "-")
    
    package_json = {
        "name": safe_name,
        "productName": name,
        "version": "1.0.0",
        "description": description,
        "main": "main.js",
        "scripts": {
            "start": "electron .",
            "pack": "electron-builder --dir",
            "dist": "electron-builder"
        },
        "author": "",
        "license": "ISC",
        "devDependencies": {
            "electron": "^28.0.0",
            "electron-builder": "^24.9.0"
        }
    }

    main_js = f"""
const {{ app, BrowserWindow }} = require('electron')
const path = require('path')

function createWindow () {{
  const win = new BrowserWindow({{
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {{
      nodeIntegration: false,
      contextIsolation: true
    }}
  }})

  win.loadURL('{url}')
  // win.setMenu(null) // Uncomment to hide menu bar
}}

app.whenReady().then(() => {{
  createWindow()

  app.on('activate', () => {{
    if (BrowserWindow.getAllWindows().length === 0) {{
      createWindow()
    }}
  }})
}})

app.on('window-all-closed', () => {{
  if (process.platform !== 'darwin') {{
    app.quit()
  }}
}})
"""
    return json.dumps(package_json, indent=2), main_js

def generate_pwa_files(name, url, description, theme_color):
    """Generate content for PWA files."""
    manifest = {
        "name": name,
        "short_name": name,
        "description": description,
        "start_url": url,
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": theme_color,
        "icons": [
            {
                "src": "icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }

    sw_js = """
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
"""
    return json.dumps(manifest, indent=2), sw_js

def check_android_requirements():
    """Check if Android build tools are available."""
    npm_path = shutil.which("npm")
    java_path = shutil.which("java")
    android_home = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT")
    
    # Simple check for tools
    return npm_path and java_path and android_home

def build_android_apk(temp_dir, safe_name, name, url, icon_path):
    """
    Attempt to build the Android APK in the temporary directory.
    Returns path to APK if successful, None otherwise.
    """
    try:
        project_path = os.path.join(temp_dir, 'android_project')
        os.makedirs(project_path, exist_ok=True)

        # 1. Initialize Capacitor Project
        # We do this manually to avoid interactive prompts
        package_json = {
            "name": safe_name,
            "version": "1.0.0",
            "description": "Android App",
            "dependencies": {
                "@capacitor/android": "^5.0.0",
                "@capacitor/core": "^5.0.0",
                "@capacitor/cli": "^5.0.0"
            }
        }
        
        with open(os.path.join(project_path, 'package.json'), 'w') as f:
            json.dump(package_json, f)
            
        capacitor_config = {
            "appId": f"com.example.{safe_name.replace('-', '')}",
            "appName": name,
            "webDir": "www",
            "bundledWebRuntime": False
        }
        
        with open(os.path.join(project_path, 'capacitor.config.json'), 'w') as f:
            json.dump(capacitor_config, f)
            
        # Create www folder and index.html (The WebView Wrapper)
        os.makedirs(os.path.join(project_path, 'www'), exist_ok=True)
        with open(os.path.join(project_path, 'www', 'index.html'), 'w') as f:
            f.write(f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name}</title>
    <style>
        body, html {{ margin: 0; padding: 0; height: 100%; overflow: hidden; }}
        iframe {{ width: 100%; height: 100%; border: none; }}
    </style>
    <script>
        // Simple redirect fallback
        window.location.href = "{url}";
    </script>
</head>
<body>
    <iframe src="{url}"></iframe>
</body>
</html>
""")

        # 2. Install Dependencies
        subprocess.check_call(["npm", "install"], cwd=project_path, shell=True)
        
        # 3. Add Android Platform
        subprocess.check_call(["npx", "cap", "add", "android"], cwd=project_path, shell=True)
        
        # 4. Build APK
        # Navigate to android folder and run gradle
        android_dir = os.path.join(project_path, 'android')
        if os.name == 'nt':
            gradlew = 'gradlew.bat'
        else:
            gradlew = './gradlew'
            subprocess.check_call(['chmod', '+x', gradlew], cwd=android_dir)
            
        subprocess.check_call([os.path.join(android_dir, gradlew), 'assembleDebug'], cwd=android_dir, shell=True)
        
        # Find the APK
        apk_path = os.path.join(android_dir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
        if os.path.exists(apk_path):
            return apk_path
            
    except Exception as e:
        print(f"Build failed: {e}")
        return None
    return None

def create_app_bundle(name, url, description, theme_color, icon_bytes, platforms):
    """
    Create a ZIP bundle containing the generated app files.
    """
    zip_buffer = io.BytesIO()
    
    try:
        # Process Icon
        img = Image.open(io.BytesIO(icon_bytes))
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        safe_name = "".join(x for x in name.lower() if x.isalnum() or x == "-").replace(" ", "-")
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            
            # --- Electron Files ---
            if 'electron' in platforms:
                pkg_json, main_js = generate_electron_files(name, url, description)
                zip_file.writestr('electron/package.json', pkg_json)
                zip_file.writestr('electron/main.js', main_js)
                
                icon_out = io.BytesIO()
                img.save(icon_out, format='PNG')
                zip_file.writestr('electron/icon.png', icon_out.getvalue())
                
                zip_file.writestr('electron/README.md', f"""# {name} - Desktop App\n\nTo run: `npm install` then `npm start`.""")

            # --- PWA Files ---
            if 'pwa' in platforms:
                manifest, sw_js = generate_pwa_files(name, url, description, theme_color)
                zip_file.writestr('pwa/manifest.json', manifest)
                zip_file.writestr('pwa/service-worker.js', sw_js)
                
                for size in [192, 512]:
                    icon_out = io.BytesIO()
                    resized = img.resize((size, size), Image.Resampling.LANCZOS)
                    resized.save(icon_out, format='PNG')
                    zip_file.writestr(f'pwa/icon-{size}x{size}.png', icon_out.getvalue())

            # --- Android / Capacitor ---
            if 'android' in platforms:
                # Create a proper project structure regardless of build success
                project_root = 'mobile-capacitor'
                
                # 1. Package.json
                package_json = {
                    "name": safe_name,
                    "version": "1.0.0",
                    "description": description,
                    "scripts": {
                        "build": "npx cap add android && npx cap open android"
                    },
                    "dependencies": {
                        "@capacitor/android": "^5.0.0",
                        "@capacitor/core": "^5.0.0",
                        "@capacitor/cli": "^5.0.0"
                    }
                }
                zip_file.writestr(f'{project_root}/package.json', json.dumps(package_json, indent=2))
                
                # 2. Capacitor Config
                cap_config = {
                    "appId": f"com.example.{safe_name.replace('-', '')}",
                    "appName": name,
                    "webDir": "www",
                    "bundledWebRuntime": False
                }
                zip_file.writestr(f'{project_root}/capacitor.config.json', json.dumps(cap_config, indent=2))
                
                # 3. WWW Content
                zip_file.writestr(f'{project_root}/www/index.html', f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0; url={url}">
    <title>{name}</title>
    <script>window.location.href = "{url}";</script>
</head>
<body>
    <p>Redirecting to <a href="{url}">{url}</a>...</p>
</body>
</html>
""")
                
                # 4. Attempt to build APK if tools are available
                apk_included = False
                build_log = "Build Skipped: Android SDK or Java not found on server."
                
                if check_android_requirements():
                    try:
                        with tempfile.TemporaryDirectory() as temp_dir:
                            # Save icon to temp for build
                            icon_path = os.path.join(temp_dir, 'icon.png')
                            img.save(icon_path, format='PNG')
                            
                            apk_path = build_android_apk(temp_dir, safe_name, name, url, icon_path)
                            
                            if apk_path and os.path.exists(apk_path):
                                zip_file.write(apk_path, f'{project_root}/build/app-debug.apk')
                                apk_included = True
                                build_log = "Build Success: APK included in build/ folder."
                            else:
                                build_log = "Build Failed: Check server logs for details."
                    except Exception as e:
                         build_log = f"Build Error: {str(e)}"
                
                zip_file.writestr(f'{project_root}/BUILD_STATUS.txt', build_log)
                
                zip_file.writestr(f'{project_root}/README.md', f"""
# Mobile App (Capacitor)

{build_log}

## How to Build Manually

1. Install Node.js, Java (JDK 17), and Android Studio.
2. Open this folder in terminal.
3. Run `npm install`.
4. Run `npx cap add android`.
5. Run `npx cap open android` (opens Android Studio) OR `cd android && ./gradlew assembleDebug`.
""")

    except Exception as e:
        raise ValueError(f"Failed to generate bundle: {str(e)}")

    zip_buffer.seek(0)
    return zip_buffer
