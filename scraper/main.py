import sys
import time
import pandas as pd
from selenium import webdriver
from bs4 import BeautifulSoup
from urllib.parse import urljoin

visited = set()
MAX_PAGES = 10  # prevent infinite crawl

def scrape_page(driver, url):
    driver.get(url)
    time.sleep(2)

    soup = BeautifulSoup(driver.page_source, "html.parser")

    data = []

    # 🔥 Generic scraping (edit selectors per site)
    items = soup.find_all("div")

    for item in items[:20]:
        text = item.get_text(strip=True)
        if text:
            data.append({"content": text})

    return data, soup


def crawl(start_url):
    driver = webdriver.Chrome()
    to_visit = [start_url]
    all_data = []

    while to_visit and len(visited) < MAX_PAGES:
        url = to_visit.pop(0)

        if url in visited:
            continue

        print(f"Visiting: {url}")
        visited.add(url)

        try:
            data, soup = scrape_page(driver, url)
            all_data.extend(data)

            links = soup.find_all("a", href=True)

            for link in links:
                full_url = urljoin(start_url, link["href"])

                if start_url in full_url and full_url not in visited:
                    to_visit.append(full_url)

        except Exception as e:
            print("Error:", e)

    driver.quit()
    return all_data


def export(data):
    df = pd.DataFrame(data)

    df.to_csv("output/data.csv", index=False)
    df.to_excel("output/data.xlsx", index=False)


if __name__ == "__main__":
    url = sys.argv[1]

    data = crawl(url)
    export(data)

    print("DONE ✅")
