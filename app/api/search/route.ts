import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const url = `https://www.manhwaland.blog/?s=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = $('.listupd .bs')
      .map((_, el) => {
        const $el = $(el);
        const title = $el.find('.tt').text().trim();
        const url = $el.find('a').attr('href');
        const thumbnail = $el.find('img').attr('src');
        const latestChapter = $el.find('.epxs').text().trim();

        return {
          title,
          url,
          thumbnail,
          latestChapter,
        };
      })
      .get();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}

