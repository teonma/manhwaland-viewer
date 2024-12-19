import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/utils/telegram-bot';

async function fetchWithRetry(url: string): Promise<Response> {
  const response = await fetch(url)
  if (response.status === 404) {
    const urlParts = url.split('-')
    const lastPart = urlParts[urlParts.length - 1]
    const chapterNumber = lastPart.replace('/', '')
    
    let alternativeUrl: string
    if (chapterNumber.length === 2 && chapterNumber.startsWith('0')) {
      // Try without leading zero
      alternativeUrl = url.replace(`-${chapterNumber}`, `-${chapterNumber.slice(1)}`)
    } else {
      // Try with leading zero
      alternativeUrl = url.replace(`-${chapterNumber}`, `-${chapterNumber.padStart(2, '0')}`)
    }
    
    return fetch(alternativeUrl)
  }
  return response
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const directInput = searchParams.get('input')

  if (!url && !directInput) {
    return NextResponse.json({ error: 'URL or input data is required' }, { status: 400 })
  }

  try {
    let images: string[] = []

    const validDomains = [
      'cdn-jp-gmbr.gmbr.pro/storage/drive',
      'aim.gmbr.pro/storage/drive',
      'cdn-go-wd.gmbr.pro/storage/drive',	
      'in.gmbr.pro/storage/drive',	
      'svr-65.gmbr.pro/storage/drive',
      'img-uwak.gmbr.pro/storage/drive',
      'cdn-okto.gmbr.pro/storage/drive',
      'v1-kj.gmbr.pro/storage/drive',
      'jp.belajarserver.xyz/storage/drive',
      'cdn-jp-gmbr.gmbr.pro/storage/drive',
      'img-id.gmbr.pro/uploads/manga-images',
      'kj.gmbr.pro/storage/drive',
      'img.gmbar.xyz/storage/drive',
      'cdn-kj.gmbr.pro/storage/drive',
      'gmbr.manhwaland.in/uploads/manga-images',
      'i3.wp.com/cdn-go-wd.gmbr.pro/storage',
      'gmbr.pro',
      'belajarserver.xyz',
      'gmbar.xyz',
      'wp.com',
      'cdn.uqni.net/images',
      'uqni.net',
      'go.gmbar.xyz/storage/drive',
      'in.gmbr.pro/uploads/manga-images/d',
      'in.gmbr.pro',
      'go.uwakjawa.xyz/storage/drive',
      'wibulep.xyz/uploads/manga-images/d',
      'kambingjantan.cc/storage/drive',
      'kambingjantan.cc',
      'wibulep.xyz'
    ]

    const isValidImageUrl = (url: string) => {
      return validDomains.some(domain => url.includes(domain))
    }

    if (directInput) {
      const inputData = JSON.parse(directInput)
      if (inputData.sources && Array.isArray(inputData.sources)) {
        for (const source of inputData.sources) {
          if (source.images && Array.isArray(source.images)) {
            const filteredImages = source.images.filter((img: string) => 
              isValidImageUrl(img)
            ).map((img: string) => img.replace(/\\\//g, '/'))
            images = images.concat(filteredImages)
          }
        }
      }
    } else if (url) {
      const response = await fetchWithRetry(url)
      const html = await response.text()
      const regex = new RegExp(validDomains.map(domain => 
        `https?://${domain.replace(/\//g, '\\/')}\/[^"'\\s]+`
      ).join('|'), 'g')
      const matches = html.match(regex)
      if (matches) {
        images = matches.map(img => img.replace(/\\\//g, '/'))
      }
    }

    if (images.length === 0) {
      const errorMessage = 'No images found from the specified source';
      const targetUrl = url || 'Direct input';
      const timestamp = new Date().toISOString();
      await sendTelegramMessage(
        `🚨 <b>Error Alert</b>\n\n` +
        `<b>Error:</b> ${errorMessage}\n` +
        `<b>Target URL:</b> ${targetUrl}\n` +
        `<b>Timestamp:</b> ${timestamp}\n` +
        `<b>User Agent:</b> Server-side request`
      );
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = 'Failed to fetch chapter';
    const targetUrl = url || 'Direct input';
    const timestamp = new Date().toISOString();
    await sendTelegramMessage(
      `🚨 <b>Error Alert</b>\n\n` +
      `<b>Error:</b> ${errorMessage}\n` +
      `<b>Target URL:</b> ${targetUrl}\n` +
      `<b>Details:</b> ${error.message}\n` +
      `<b>Timestamp:</b> ${timestamp}\n` +
      `<b>Stack:</b> ${error.stack || 'No stack trace available'}`
    );
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

