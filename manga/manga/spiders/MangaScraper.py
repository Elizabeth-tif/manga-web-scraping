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
            'image': response.css('img::attr(data-src)').get()
        }