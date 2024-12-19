// pages/api/scrape.ts
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface ScrapedData {
  links: string[];
  domains: Set<string>;
  cardUrls: string[];
}

const validImageExtensions = /\.(jpeg|png|jpg|webp)$/i;

function getCardUrl(imageUrl: string): string | null {
    try {
        const url = new URL(imageUrl);
        const pathSegments = url.pathname.split('/').filter(Boolean); // Remove empty segments
        if (pathSegments.length >= 4) {
            return `${url.origin}/${pathSegments[0]}/${pathSegments[1]}/${pathSegments[2]}/${pathSegments[3]}`;
        }
        return null;
    } catch (error) {
        console.warn("Invalid URL format:", imageUrl)
        return null
    }
}

function extractImagesFromJson(jsonStr: string): ScrapedData {
  const links: string[] = [];
  const domains: Set<string> = new Set();
  const cardUrls: string[] = [];
  const domainTracker: Record<string, boolean> = {}; // Keep track of domains used

  try {
    const match = jsonStr.match(/ts_reader\.run\s*\(\s*(.*?)\s*\);/s);
    if (match) {
      const jsonString = match[1];

      try {
        const readerData = JSON.parse(jsonString);

        if (readerData.sources && Array.isArray(readerData.sources)) {
          readerData.sources.forEach((source: any) => {
            if (source.images && Array.isArray(source.images)) {
              source.images.forEach((img: string) => {
                if (validImageExtensions.test(img)) {
                    try {
                      const domain = new URL(img).hostname;
                      if (!domainTracker[domain]) { // Check if we haven't used this domain yet
                        domainTracker[domain] = true;
                        links.push(img);
                        domains.add(domain);
                        const cardUrl = getCardUrl(img)
                        if (cardUrl) {
                           cardUrls.push(cardUrl)
                        }
                     }
                    } catch (error) {
                      console.warn('Invalid URL during JSON parsing:', img);
                    }
                }
              });
            }
          });
        }
      } catch (parseError) {
          console.error('Error parsing JSON within ts_reader.run:', parseError, `\nJSON string: ${jsonString}`);
      }
    }
  } catch (error) {
    console.error('Error extracting from JSON:', error, `\nJSON string: ${jsonStr}`);
  }

  return { links, domains, cardUrls };
}


function extractImagesFromHtml(html: string): ScrapedData {
  const links: string[] = [];
  const domains: Set<string> = new Set();
  const cardUrls: string[] = [];
    const domainTracker: Record<string, boolean> = {}; // Keep track of domains used

  const $ = cheerio.load(html);

  $('img').each((_, element) => {
    const src = $(element).attr('src');
    if (src && validImageExtensions.test(src)) {
       try {
           const domain = new URL(src).hostname;
           if (!domainTracker[domain]) {
            domainTracker[domain] = true;
            links.push(src);
             domains.add(domain);
              const cardUrl = getCardUrl(src)
              if (cardUrl) {
                  cardUrls.push(cardUrl)
              }
           }
        } catch (error) {
            console.warn('Invalid URL during HTML parsing:', src);
        }
    }
  });

  return { links, domains, cardUrls };
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const input = searchParams.get('input');

  if (!url && !input) {
    return NextResponse.json({ error: 'URL or input data is required' }, { status: 400 });
  }

  try {
    let data: ScrapedData = {
      links: [],
      domains: new Set(),
      cardUrls: []
    };

     if (input) {
         const jsonData = extractImagesFromJson(input)
          data.links.push(...jsonData.links)
          jsonData.domains.forEach(domain => data.domains.add(domain))
          data.cardUrls.push(...jsonData.cardUrls)
        } else if (url) {
         const response = await fetch(url);
         const html = await response.text();
            
          // Extract images from HTML tags
          const htmlData = extractImagesFromHtml(html);
          data.links.push(...htmlData.links)
          htmlData.domains.forEach(domain => data.domains.add(domain))
          data.cardUrls.push(...htmlData.cardUrls)
            
          // Attempt to extract images from JSON in script tags
          const jsonData = extractImagesFromJson(html);
          data.links.push(...jsonData.links);
          jsonData.domains.forEach(domain => data.domains.add(domain));
          data.cardUrls.push(...jsonData.cardUrls)
        }
    return NextResponse.json({
      links: data.links,
      domains: Array.from(data.domains),
      cardUrls: Array.from(new Set(data.cardUrls))  // Ensure unique card URLs
    });
  } catch (error) {
    console.error('Error scraping:', error);
    return NextResponse.json({ error: 'Failed to scrape the content' }, { status: 500 });
  }
}

