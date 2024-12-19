// app/api/fetch-series-detail/route.ts
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

async function fetchThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    let thumbnailUrl = null;

      $('meta').each((i, elem) => {
        const property = $(elem).attr('property');
        if (property === 'og:image' || property === 'primaryImageOfPage') {
          thumbnailUrl = $(elem).attr('content');
          return false; // break the loop
        }
      });

    if (!thumbnailUrl) {
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html());
          if (jsonData.primaryImageOfPage) {
            thumbnailUrl =
              jsonData.primaryImageOfPage.contentUrl || jsonData.primaryImageOfPage;
            return false;
          }
        } catch (e) {
          console.error('Error parsing JSON-LD:', e);
        }
      });
    }

    if (!thumbnailUrl) {
      thumbnailUrl = $('.thumb img').attr('src');
    }

    return thumbnailUrl;
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return null;
  }
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
  }

  try {
    const baseUrl = 'https://www.manhwaland.blog/manga/';
    const url = `${baseUrl}${slug}/`;

    const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
    const html = await response.text()
    const $ = cheerio.load(html)

    const title = $('.infox h1').text().trim()
    const description = $('.entry-content p').first().text().trim()
    const thumbnail = await fetchThumbnail(url);
    
    const chapters = $('.bxcl ul li')
        .map((_, el) => {
        const $el = $(el)
        const chapterTitle = $el.find('a').text().trim()
        const chapterUrl = $el.find('a').attr('href')
        
        return {
            url: chapterUrl,
            title: chapterTitle
        }
    }).get();


    const series = {
      title,
      thumbnail,
      description,
      chapters
    }

     return NextResponse.json({ series });
  } catch (error) {
    console.error("Error fetching series detail:", error);
    return NextResponse.json({ error: "Failed to fetch series detail." }, { status: 500 });
  }
}

