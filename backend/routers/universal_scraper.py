from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict
from googlesearch import search
import time
from enum import Enum

router = APIRouter()

# Define categories for search strategies
class SearchCategory(str, Enum):
    movie = "movie"
    app = "app"
    pdf = "pdf"
    image = "image"
    general = "general" # For a generic search without specific strategy

# UniversalScraper class based on user's provided logic
class UniversalScraper:
    def __init__(self):
        self.strategies = {
            "movie": {
                "keywords": "watch online streaming review",
                "sites": ["imdb.com", "rottentomatoes.com", "justwatch.com", "netflix.com", "primevideo.com"]
            },
            "app": {
                "keywords": "download install",
                "sites": ["play.google.com", "apps.apple.com", "github.com", "f-droid.org"]
            },
            "pdf": {
                "keywords": "",
                "filetype": "pdf"
            },
            "image": {
                "keywords": "",
                "sites": ["pinterest.com", "flickr.com", "unsplash.com"]
            },
            "general": {
                "keywords": "",
                "sites": []
            }
        }

    def build_query(self, user_query: str, category: SearchCategory):
        config = self.strategies.get(category.value)
        
        if not config:
            return f"{user_query}"

        search_string = f"{user_query}"
        
        if "keywords" in config and config["keywords"]:
            search_string += f" {config['keywords']}"

        if "sites" in config and config["sites"]:
            site_operator = " OR ".join([f"site:{site}" for site in config["sites"]])
            search_string += f" ({site_operator})"
            
        if "filetype" in config:
            search_string += f" filetype:{config['filetype']}"

        return search_string

    def find_content(self, query: str, category: SearchCategory, num_results: int = 10):
        print(f"--- Searching for '{query}' in category: '{category}' ---")
        
        advanced_query = self.build_query(query, category)
        print(f"Generated Search Query: {advanced_query}\n")
        
        results = []
        
        try:
            # The googlesearch library might block if too many requests are made too quickly.
            # Adding a small delay is good practice.
            for result_url in search(advanced_query, num_results=num_results, advanced=True, stop=num_results, pause=2):
                data = {
                    "title": result_url.title,
                    "link": result_url.url,
                    "description": result_url.description
                }
                results.append(data)
                
        except Exception as e:
            # googlesearch can raise exceptions (e.g., HTTP errors, rate limiting)
            print(f"Error during search: {e}")
            raise HTTPException(status_code=500, detail=f"Search failed: {e}")

        return results

# Instantiate the scraper tool
universal_scraper_tool = UniversalScraper()

# FastAPI endpoint
@router.get("/api/search/universal")
async def universal_search(
    query: str = Query(..., min_length=1, description="The search query."),
    category: SearchCategory = Query(SearchCategory.general, description="The category of content to search for."),
    num_results: int = Query(10, ge=1, le=20, description="Number of search results to return.")
):
    """
    Performs a universal search across the web for specified content categories
    using Google search operators.
    """
    try:
        search_results = universal_scraper_tool.find_content(query, category, num_results)
        return {"query": query, "category": category, "results": search_results}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
