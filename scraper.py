def scrape(url):
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        res = requests.get(url, headers=headers, timeout=10)

        if res.status_code != 200:
            return [], None

        soup = BeautifulSoup(res.text, "html.parser")

        data = []

        for tag in soup.find_all(["h1", "h2", "p"]):
            text = tag.get_text(strip=True)
            if text:
                data.append({"content": text})

        return data, soup

    except Exception as e:
        print("Scrape error:", e)
        return [], None
