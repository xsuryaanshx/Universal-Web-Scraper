import sys
import requests
from bs4 import BeautifulSoup
import pandas as pd
from urllib.parse import urljoin, urlparse
import os
import time

visited = set()
MAX_PAGES = 5
REQUEST_DELAY = 0.5  # Polite crawling delay

def is_valid_url(url, base_domain):
    """Check if URL is valid and belongs to the same domain"""
    try:
        parsed = urlparse(url)
        base_parsed = urlparse(base_domain)
        
        # Must have scheme and netloc
        if not parsed.scheme or not parsed.netloc:
            return False
        
        # Must be http or https
        if parsed.scheme not in ['http', 'https']:
            return False
        
        # Must be same domain
        if parsed.netloc != base_parsed.netloc:
            return False
        
        # Avoid common non-content URLs
        skip_extensions = ['.pdf', '.jpg', '.png', '.gif', '.zip', '.exe', '.css', '.js']
        if any(url.lower().endswith(ext) for ext in skip_extensions):
            return False
        
        return True
    except:
        return False


def scrape(url):
    """Scrape content from a single page"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        res = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {str(e)}", file=sys.stderr)
        return [], None

    soup = BeautifulSoup(res.text, "html.parser")
    
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "footer", "header"]):
        script.decompose()

    data = []
    
    # Extract text from various tags
    for tag in soup.find_all(["h1", "h2", "h3", "p", "li", "td"]):
        text = tag.get_text(strip=True)
        if text and len(text) > 10:  # Filter out very short text
            data.append({
                "url": url,
                "tag": tag.name,
                "content": text[:500]  # Limit content length
            })

    return data, soup


def crawl(start_url):
    """Crawl multiple pages starting from start_url"""
    to_visit = [start_url]
    all_data = []

    print(f"Starting crawl from: {start_url}", file=sys.stderr)

    while to_visit and len(visited) < MAX_PAGES:
        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)
        print(f"Scraping ({len(visited)}/{MAX_PAGES}): {url}", file=sys.stderr)

        try:
            # Polite crawling - add delay
            if len(visited) > 1:
                time.sleep(REQUEST_DELAY)
            
            data, soup = scrape(url)
            
            if data:
                all_data.extend(data)
                print(f"  ✓ Extracted {len(data)} items", file=sys.stderr)
            
            if soup and len(visited) < MAX_PAGES:
                # Find more links to crawl
                links = soup.find_all("a", href=True)
                
                for link in links[:50]:  # Limit links per page
                    full_url = urljoin(url, link["href"])
                    
                    # Remove fragment
                    full_url = full_url.split('#')[0]
                    
                    if is_valid_url(full_url, start_url) and full_url not in visited:
                        to_visit.append(full_url)

        except Exception as e:
            print(f"  ✗ Error on {url}: {str(e)}", file=sys.stderr)
            continue

    print(f"Crawl complete. Visited {len(visited)} pages, extracted {len(all_data)} items", file=sys.stderr)
    return all_data


def export(data):
    """Export data to CSV"""
    os.makedirs("output", exist_ok=True)
    
    if not data:
        # Create empty CSV with headers
        df = pd.DataFrame(columns=["url", "tag", "content"])
    else:
        df = pd.DataFrame(data)
    
    output_path = "output/data.csv"
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"Exported to {output_path}", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scraper.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    
    # Validate URL
    try:
        parsed = urlparse(url)
        if not parsed.scheme:
            url = "https://" + url
    except:
        print("Invalid URL", file=sys.stderr)
        sys.exit(1)
    
    try:
        data = crawl(url)
        export(data)
        print("DONE")
    except Exception as e:
        print(f"Fatal error: {str(e)}", file=sys.stderr)
        sys.exit(1)
