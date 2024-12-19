import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function formatTitleForChapterUrl(title: string): string {
  return title
    .replace(/(\d+)(\d{3})/g, '$1-$2')
    .replace(/manga\//, '')
    .replace(/\/$/, '');
}

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

    // Look for primaryImageOfPage in meta tags
    $('meta').each((i, elem) => {
      const property = $(elem).attr('property');
      if (property === 'og:image' || property === 'primaryImageOfPage') {
        thumbnailUrl = $(elem).attr('content');
        return false; // break the loop
      }
    });

    // If not found in meta tags, look for it in JSON-LD script
    if (!thumbnailUrl) {
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html());
          if (jsonData.primaryImageOfPage) {
            thumbnailUrl =
              jsonData.primaryImageOfPage.contentUrl || jsonData.primaryImageOfPage;
            return false; // break the loop
          }
        } catch (e) {
          console.error('Error parsing JSON-LD:', e);
        }
      });
    }

    // If still not found, fallback to previous method
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
  const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const order = searchParams.get('order');
    const search = searchParams.get('search');

    if (!type) {
        return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
    }
  try {
    let url = new URL('https://www.manhwaland.blog/manga/');
      url.searchParams.append('type', type);
      url.searchParams.append('page', page.toString());
      if (status && status !== 'all') url.searchParams.append('status', status);
      if (order && order !== 'default') url.searchParams.append('order', order);
      if (search) url.searchParams.append('s', search);

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });


    const html = await response.text();
    const $ = cheerio.load(html);

    const mangaPromises = $('.listupd .bs')
        .slice(0, limit)
        .map(async (_, el) => {
          const $el = $(el);
          const title = $el.find('.tt').text().trim();
          const url = $el.find('a').attr('href');
          const latestChapter = $el.find('.epxs').text().trim();
          const seriesStatus = $el.find('.status').text().trim();

          const seriesSlug = url ? formatTitleForChapterUrl(url) : null;
          const chapterUrl = seriesSlug
            ? `https://www.manhwaland.blog/${seriesSlug}-chapter-01/`
            : null;
          
          let thumbnail = null;
          if (url) {
            thumbnail = await fetchThumbnail(url);
          }
           // Generate a random rating between 3.5 and 5.0
          const rating = Math.random() * (5.0 - 3.5) + 3.5;

          return {
            title,
            url: chapterUrl,
            thumbnail,
            chapter: latestChapter,
            rating: parseFloat(rating.toFixed(1)),
            status: seriesStatus,
          };
        })
        .get();

    const series = await Promise.all(mangaPromises);
    const filteredSeries = series.filter((item) => item.title && item.url && item.thumbnail);

    if (filteredSeries.length === 0) {
      return NextResponse.json({ error: 'No manga found. Please try different filters or check back later.' }, { status: 404 });
    }


    // Extract total pages from pagination
    const totalPages = $('.hpage .r').text().match(/of\\s+(\\d+)/i);
    const totalPagesNumber = totalPages ? parseInt(totalPages[1], 10) : 1;


    return NextResponse.json({
      series: filteredSeries,
      currentPage: page,
      totalPages: Math.min(totalPagesNumber, 100), // Limit to 100 pages
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

