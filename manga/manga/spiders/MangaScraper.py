import scrapy

class MangaSpider(scrapy.Spider):
    name = "manga-spider"
    start_urls = ["https://myanimelist.net/topmanga.php"]

    def parse(self, response):
        for mangas in response.css('tr.ranking-list'):
            manga_page = mangas.css('a.hoverinfo_trigger.fl-l.ml12.mr8::attr(href)').get()

            yield scrapy.Request(url=manga_page, callback=self.parse_manga_details)
    
    def parse_manga_details(self, response):
        yield {
            'rank': response.css('span.numbers.ranked strong::text').get()[1:],
            'title': response.css('span[itemprop="name"]::text').get(),
            'image': response.css('img::attr(data-src)').get(),
            'members': response.css('span.numbers.members strong::text').get(),
            'score': response.css('div.score-label::text').get(),
            'sinopsis' : response.css('span[itemprop="description"]::text').get(),
            'type': self.get_manga_type(response),
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