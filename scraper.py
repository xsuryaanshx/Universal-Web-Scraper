import sys
import requests
from bs4 import BeautifulSoup
import pandas as pd
from urllib.parse import urljoin
import os

visited = set()
MAX_PAGES = 5


def scrape(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers, timeout=10)

    soup = BeautifulSoup(res.text, "html.parser")

    data = []

    for tag in soup.find_all(["h1", "h2", "p"]):
        text = tag.get_text(strip=True)
        if text:
            data.append({"content": text})

    return data, soup


def crawl(start_url):
    to_visit = [start_url]
    all_data = []

    while to_visit and len(visited) < MAX_PAGES:
        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)

        try:
            data, soup = scrape(url)
            all_data.extend(data)

            links = soup.find_all("a", href=True)

            for link in links:
                full_url = urljoin(start_url, link["href"])

                if start_url in full_url and full_url not in visited:
                    to_visit.append(full_url)

        except:
            pass

    return all_data


def export(data):
    os.makedirs("output", exist_ok=True)
    df = pd.DataFrame(data)
    df.to_csv("output/data.csv", index=False)


if __name__ == "__main__":
    url = sys.argv[1]

    data = crawl(url)
    export(data)

    print("DONE")
