import streamlit as st
import time
import re

# --- IMPORT HANDLING ---
try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        st.error("🚨 Library missing! Run: pip install ddgs")
        st.stop()

# --- CONFIGURATION ---
st.set_page_config(page_title="Ultimate Scraper Pro", page_icon="⚡", layout="centered")

# --- CUSTOM CSS ---
st.markdown("""
<style>
    .result-card {
        background-color: #0E1117;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #333;
        margin-bottom: 10px;
    }
    .result-card:hover { border-color: #00ADB5; }
    .card-title { font-size: 18px; font-weight: bold; color: #00ADB5; text-decoration: none; }
    .card-link { font-size: 12px; color: #888; margin-bottom: 5px; word-break: break-all; }
    .card-desc { font-size: 14px; color: #CCC; }
    .mode-badge { font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; float: right; }
</style>
""", unsafe_allow_html=True)

class SmartScraper:
    def __init__(self):
        self.strategies = {
            "Movie": {
                "Official": "site:netflix.com OR site:primevideo.com OR site:hotstar.com OR site:imdb.com OR site:hulu.com watch online",
                "Unofficial": "site:popcornflix.com OR site:filmzie.com OR site:archive.org OR \"Filmyzilla\" OR \"MoviesFlix\" OR \"Vegamovies\" OR \"Index of\" parent directory mkv"
            },
            "Game": {
                "Official": "site:steampowered.com OR site:epicgames.com OR site:gog.com OR site:play.google.com buy download",
                "Unofficial": "site:filecr.com OR site:uptodown.com OR \"FitGirl Repacks\" OR \"DODI Repacks\" OR \"Ocean of Games\" OR site:1337x.to free download"
            },
            "App": {
                "Official": "site:play.google.com OR site:apps.apple.com OR site:microsoft.com",
                "Unofficial": "site:uptodown.com OR site:apkpure.com OR site:apkmirror.com OR site:moddroid.com OR site:rexdl.com mod apk"
            },
            "Course": {
                "Official": "site:udemy.com OR site:coursera.org OR site:edx.org",
                "Unofficial": "site:1337x.to OR \"Google Drive\" OR site:archive.org OR \"Udemy Free\" free download course"
            }
        }

    def is_chinese(self, text):
        if not text: return False
        return bool(re.search(r'[\u4e00-\u9fff]', text))

    def clean_data(self, raw_data):
        # Base cleaner function
        cleaned = []
        for r in raw_data:
            title = r.get('title') or r.get('head') or r.get('header') or 'No Title'
            url = r.get('href') or r.get('link') or r.get('url') or '#'
            desc = r.get('body') or r.get('snippet') or r.get('desc') or r.get('description') or 'No Description'
            
            cleaned.append({
                "title": title,
                "url": url,
                "desc": desc
            })
        return cleaned

    def filter_results(self, clean_list):
        strict_list = []
        relaxed_list = []

        for item in clean_list:
            title_has_chinese = self.is_chinese(item['title'])
            body_has_chinese = self.is_chinese(item['desc'])

            # Strict: No Chinese anywhere
            if not title_has_chinese and not body_has_chinese:
                strict_list.append(item)
            
            # Relaxed: Only Title must be English (Body can have some weird chars)
            if not title_has_chinese:
                relaxed_list.append(item)
        
        return strict_list, relaxed_list

    def search(self, query, category, mode):
        cat_data = self.strategies.get(category, {})
        suffix = cat_data.get(mode, "free download")
        
        final_query = f"{query} {suffix}"
        results = []
        filter_status = "Strict English"
        
        try:
            with DDGS() as ddgs:
                # Fetch MORE results (25) to handle filtering loss
                gen = ddgs.text(final_query, region='us-en', safesearch='off', max_results=25)
                raw_results = list(gen) if gen else []
                
                # Fallback if 0 raw results
                if not raw_results:
                    final_query = f"{query} {category} download"
                    gen = ddgs.text(final_query, region='us-en', safesearch='off', max_results=25)
                    raw_results = list(gen) if gen else []

                # Clean Data Structure
                cleaned_data = self.clean_data(raw_results)

                # Apply Filters
                strict, relaxed = self.filter_results(cleaned_data)

                # Decision Logic
                if strict:
                    results = strict
                    filter_status = "Verified English"
                elif relaxed:
                    results = relaxed
                    filter_status = "Mostly English (Relaxed Filter)"
                else:
                    results = cleaned_data
                    filter_status = "Raw Results (Language Mix)"

        except Exception as e:
            st.error(f"Search Error: {e}")
            
        return results, filter_status

# --- UI LOGIC ---
def main():
    st.title("⚡ Ultimate Content Finder")
    st.markdown("Access **Official Stores** or **Unofficial Archives** instantly.")

    with st.container():
        col1, col2 = st.columns([2, 1])
        with col1:
            query = st.text_input("Enter Name", placeholder="e.g. Chhaava, GTA V...")
        with col2:
            category = st.selectbox("Category", ["Movie", "Game", "App", "Course"])

        mode_choice = st.radio("Search Mode:", ["Official (Safe/Paid)", "Unofficial (3rd Party/Free)"], horizontal=True)
        mode = "Official" if "Official" in mode_choice else "Unofficial"

        btn = st.button(f"🔍 Search {category} ({mode})", use_container_width=True)

    if btn and query:
        scraper = SmartScraper()
        
        with st.spinner(f"Searching & Filtering results for '{query}'..."):
            data, status = scraper.search(query, category, mode)
            
        if data:
            badge_color = "#28a745" if mode == "Official" else "#ffc107"
            text_color = "white" if mode == "Official" else "black"
            
            st.success(f"Found {len(data)} results! (Quality: {status})")
            
            for item in data:
                st.markdown(f"""
                <div class="result-card">
                    <span class="mode-badge" style="background-color: {badge_color}; color: {text_color};">{mode.upper()}</span>
                    <a href="{item['url']}" target="_blank" class="card-title">{item['title']}</a>
                    <div class="card-link">{item['url']}</div>
                    <div class="card-desc">{item['desc']}</div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.warning("No results found at all.")

if __name__ == "__main__":
    main()