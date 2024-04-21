import scrapy

class MangaSpider(scrapy.Spider):
    name = "manga-spider"
    start_urls = ["https://myanimelist.net/topmanga.php"]
    page_number = 0
    max_pages = 20

    custom_settings = {
        'DOWNLOAD_DELAY': 2,  
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'ROBOTSTXT_OBEY': True,
        'HTTPERROR_ALLOWED_CODES': [405],  
        'RETRY_HTTP_CODES': [500, 502, 503, 504, 522, 524, 408], 
        'RETRY_TIMES': 3,
    }

    def parse(self, response):
        for mangas in response.css('tr.ranking-list'):
            manga_page = mangas.css('a.hoverinfo_trigger.fl-l.ml12.mr8::attr(href)').get()
            if manga_page:
                yield scrapy.Request(url=response.urljoin(manga_page), callback=self.parse_manga_details)
        
        next_page = response.css('a.next::attr(href)').get()
        if next_page and self.page_number < self.max_pages:
            self.page_number += 1
            next_url = f"https://myanimelist.net/topmanga.php?limit={self.page_number * 50}"
            yield scrapy.Request(url=response.urljoin(next_url), callback=self.parse)

    def parse_manga_details(self, response):
        publishedHolder = response.css('div.spaceit_pad::text').getall()
        charImage = response.css('a.fw-n img::attr(data-src)').getall()
        charName = response.css('div.left-column.fl-l.divider tr td.borderClass a::text')[2::3].getall() + response.css('div.left-right.fl-r tr td.borderClass a::text')[2::3].getall()
        charRole = response.css('div.left-column.fl-l.divider tr td.borderClass div.spaceit_pad small::text').getall() + response.css('div.left-right.fl-r tr td.borderClass div.spaceit_pad small::text').getall()
        
        yield {
            'rank': response.css('span.numbers.ranked strong::text').get()[1:],
            'title': response.css('span[itemprop="name"]::text').get(),
            'image': response.css('img::attr(data-src)').get(),
            'members': response.css('span.numbers.members strong::text').get(),
            'score': response.css('div.score-label::text').get(),
            'sinopsis' : response.css('span[itemprop="description"]::text').get(),
            'type': self.get_manga_type(response),
            'genre': response.css('span[itemprop="genre"]::text').getall(),
            'authors': self.get_authors(response),
            'status': publishedHolder[publishedHolder.index("\n                    ")-2][1:],
            'published': publishedHolder[publishedHolder.index("\n                    ")-1][1:],
            'characters': {'name': charName, 'role': charRole, 'image': charImage},
        }

    def get_manga_type(self, response):
        # Menggunakan XPath untuk mencari <span> dan class 'dark_text' yang memiliki isi 'Type:'
        type_span = response.xpath('//span[@class="dark_text" and contains(text(), "Type:")]')
        if type_span:
            # Exkstrak tag <a> yang didalam parent <div> yang sama
            type_link = type_span.xpath('./following-sibling::a[1]')
            if type_link:
                # Ekstrak content text pada tag <a>
                manga_type = type_link.xpath('string()').get().strip()
                return manga_type

        return None  # Return None apabila type tidak ditemukan/tidak diekstrak
    
    def get_authors(self, response):
        authors = []
        authors_span = response.xpath('//span[@class="dark_text" and contains(text(), "Authors:")]')
        if authors_span:
            authors_info = authors_span.xpath('./following-sibling::a')
            for author in authors_info:
                author_name = author.xpath('string()').get()
                role = author.xpath('following-sibling::text()').get().strip()

                role = role.replace('(', '').replace(')', '').replace(',', '')

                authors.append({
                    'name': author_name,
                    'role': role
                })
            return authors
        return None