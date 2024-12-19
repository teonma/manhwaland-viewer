'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ChevronLeft, ChevronRight, BookOpen, Home, Menu } from 'lucide-react'
import Link from 'next/link'
import { useVisibility } from '@/contexts/VisibilityContext'
import ChapterList from './chapter-list'

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function ManhwaViewer() {
    const [images, setImages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [currentChapter, setCurrentChapter] = useState<number | null>(null)
    const [lastChapter, setLastChapter] = useState<number | null>(null)
    const [baseUrl, setBaseUrl] = useState('')
    const [title, setTitle] = useState('')
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
    const [isChapterListOpen, setIsChapterListOpen] = useState(false)
    const viewerRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const router = useRouter()
    const { isVisible, setIsVisible } = useVisibility()

    useEffect(() => {
      if (url) {
        setHasUrl(true)
        const cleanUrl = url.replace(/\/$/, '');
        const urlParts = cleanUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];

        const match = lastPart.match(/(.*)-chapter-(\d+)$/);
        if (match) {
          const [, titlePart, chapterNum] = match;
          const newTitle = titlePart.replace(/-/g, ' ');
          const newChapter = parseInt(chapterNum, 10);
          const newBaseUrl = urlParts.slice(0, -1).join('/');

          // Check if we're switching to a new manhwa
          if (newTitle !== title || newBaseUrl !== baseUrl) {
            // Clear the cache if it's a new manhwa
            localStorage.removeItem('manhwaViewerCache');
            setImages([]);
            setFailedImages(new Set());
            // Fetch the last chapter number
            fetchLastChapter(newBaseUrl, newTitle);
          }

          setTitle(newTitle);
          setCurrentChapter(newChapter);
          setBaseUrl(newBaseUrl);
          fetchImages(url);
        } else {
          setError('Invalid chapter URL format');
        }
      } else {
          setHasUrl(false)
          setError('You don\'t have any reading history yet.');
      }
    }, [url]);

    const fetchLastChapter = async (baseUrl: string, title: string) => {
      try {
        const response = await fetch(`/api/fetch-series-detail?slug=${title.toLowerCase().replace(/ /g, '-')}`);
        const data = await response.json();
        if (data.series && data.series.chapters && data.series.chapters.length > 0) {
          const lastChapterNum = parseInt(data.series.chapters[0].title.match(/Chapter (\d+)/i)[1], 10);
          setLastChapter(lastChapterNum);
        }
      } catch (error) {
        console.error('Error fetching last chapter:', error);
      }
    };

    const fetchImages = async (url: string) => {
        setIsLoading(true)
        setError('')
        setImages([])
        setFailedImages(new Set())

        try {
            const response = await fetch(`/api/fetch-chapter?url=${encodeURIComponent(url)}`)
            const data = await response.json()

            if (data.error) {
                setError(data.error)
            } else if (data.images && data.images.length > 0) {
                const uniqueImages = Array.from(new Set(data.images))
                setImages(uniqueImages)
            } else {
                setError('No images found from the specified source')
            }
        } catch (err) {
            setError('Failed to fetch images')
        } finally {
            setIsLoading(false)
        }
    }

    const goToChapter = (chapterNumber: number) => {
        if (chapterNumber < 1) return
        const paddedNumber = chapterNumber.toString().padStart(2, '0')
        const newUrl = `${baseUrl}/${title.toLowerCase().replace(/ /g, '-')}-chapter-${paddedNumber}/`
        setCurrentChapter(chapterNumber)
        router.push(`/view?url=${encodeURIComponent(newUrl)}`)
    }

    const goToNextChapter = () => {
        if (currentChapter !== null && lastChapter !== null && currentChapter < lastChapter) {
            goToChapter(currentChapter + 1)
        }
    }

    const goToPreviousChapter = () => {
        if (currentChapter !== null && currentChapter > 1) {
            goToChapter(currentChapter - 1)
        }
    }

    const handleImageError = (imageSrc: string) => {
        setFailedImages(prev => new Set(prev).add(imageSrc))
    }

    const reloadImage = (imageSrc: string) => {
        setFailedImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(imageSrc)
            return newSet
        })
    }

    const [hasUrl, setHasUrl] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                goToNextChapter()
            } else if (event.key === 'ArrowLeft') {
                goToPreviousChapter()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentChapter, lastChapter])

    useEffect(() => {
      const cachedData = localStorage.getItem('manhwaViewerCache')
      if (cachedData) {
        const { images: cachedImages, currentChapter: cachedChapter, lastChapter: cachedLastChapter, baseUrl: cachedBaseUrl, title: cachedTitle, failedImages: cachedFailedImages } = JSON.parse(cachedData)
        if (cachedTitle === title && cachedBaseUrl === baseUrl) {
          setImages(cachedImages)
          setCurrentChapter(cachedChapter)
          setLastChapter(cachedLastChapter)
          setBaseUrl(cachedBaseUrl)
          setTitle(cachedTitle)
          setFailedImages(new Set(cachedFailedImages))
        }
      }
    }, [title, baseUrl])

    useEffect(() => {
      if (images.length > 0 && currentChapter && lastChapter && baseUrl && title) {
        localStorage.setItem('manhwaViewerCache', JSON.stringify({
          images,
          currentChapter,
          lastChapter,
          baseUrl,
          title,
          failedImages: Array.from(failedImages)
        }))
      }
    }, [images, currentChapter, lastChapter, baseUrl, title, failedImages])

    const handleClick = () => {
        setIsVisible(!isVisible)
        setIsChapterListOpen(false)
    }

    if (!hasUrl) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">No Reading History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Link href="/series" className="w-full block">
                            <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                                <BookOpen className="mr-2 h-5 w-5" />
                                Browse Series
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gray-100" onClick={handleClick}>
            {error && (
                <Card className="w-full max-w-md mx-auto mt-4">
                    <CardContent>
                        <p className="text-red-500 text-center">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className={`fixed top-0 left-0 right-0 bg-black bg-opacity-50 text-white py-2 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex justify-between items-center px-4">
                    <Link href="/" onClick={(e) => e.stopPropagation()}>
                        <Home className="h-5 w-5" />
                    </Link>
                    <h1 className="text-sm font-semibold text-center capitalize">
                        {title && `${title} - `}Chapter {currentChapter}
                    </h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsChapterListOpen(!isChapterListOpen);
                        }}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <ChapterList
                isOpen={isChapterListOpen}
                onClose={() => setIsChapterListOpen(false)}
                currentChapter={currentChapter}
                lastChapter={lastChapter}
                onChapterSelect={goToChapter}
            />
            <div className="fixed inset-0 w-full h-full z-10">
                <div className="h-full flex flex-col">
                    <div ref={viewerRef} className="flex-grow overflow-auto bg-gray-900">
                        <div className="max-w-3xl mx-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-screen">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            ) : error ? (
                                <div className="flex justify-center items-center h-screen text-white">
                                    <p>{error}</p>
                                </div>
                            ) : (
                                images.map((image, index) => (
                                    <div key={index} className="w-full relative">
                                        {failedImages.has(image) ? (
                                            <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-red-500 mb-2">Failed to load image</p>
                                                    <Button onClick={() => reloadImage(image)} className="bg-blue-500 hover:bg-blue-600">
                                                        Reload Image
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Image
                                                src={image}
                                                alt={`Page ${index + 1}`}
                                                width={800}
                                                height={1200}
                                                className="w-full h-auto object-contain"
                                                priority={index === 0}
                                                onError={() => handleImageError(image)}
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className={`fixed bottom-4 left-4 right-4 flex justify-between items-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPreviousChapter();
                            }}
                            disabled={currentChapter === null || currentChapter <= 1}
                            size="sm"
                            className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-75"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNextChapter();
                            }}
                            disabled={currentChapter === null || lastChapter === null || currentChapter >= lastChapter}
                            size="sm"
                            className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-75"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

