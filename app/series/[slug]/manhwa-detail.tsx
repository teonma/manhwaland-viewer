'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react';

interface SeriesDetail {
  title: string
  thumbnail: string | null
  description: string
  chapters: {
      url: string
      title: string
  }[]
}

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface Props {
    slug: string
}

export default function ManhwaDetail({ slug }: Props) {
  const [detail, setDetail] = useState<SeriesDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/fetch-series-detail?slug=${slug}`)
        const data = await response.json()

         if (data.error) {
            setError(data.error);
        } else if (data.series) {
            setDetail(data.series)
        } else {
             setError('No series detail found');
        }

      } catch (error) {
        console.error("Error fetching detail:", error);
        setError("Failed to fetch series detail.");
      } finally {
           setIsLoading(false)
      }
    }

    fetchDetail()
  }, [slug])

  if(isLoading){
    return <div className='text-center text-gray-500 my-8'> <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 my-8">{error}</div>
  }

  if (!detail) {
    return <div className="text-center text-gray-500 my-8">Series detail not found.</div>;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date();
    return `Desember ${date.getDate()}, ${date.getFullYear()}`;
  };

  const extractChapterNumber = (title: string) => {
    const match = title.match(/Chapter (\d+)/i);
    return match ? match[1] : title;
  };

  return (
    <div className='space-y-8'>
      <div className='flex flex-col md:flex-row gap-8'>
        <div className='w-full md:w-1/3'>
          <Card>
            <CardContent className='p-4'>
              <div className='relative aspect-[2/3] w-full'>
                <Image 
                  src={detail.thumbnail || placeholder}
                  alt={detail.title}
                  fill
                  className='object-cover rounded-md'
                  placeholder="blur"
                  blurDataURL={placeholder}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='w-full md:w-2/3'>
          <Card>
            <CardHeader>
              <CardTitle>{detail.title}</CardTitle>
              <CardDescription>Series Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-gray-700'>{detail.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapter List</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.chapters.length > 0 && (
            <div className="flex justify-between mb-4">
              <Link href={`/view?url=${encodeURIComponent(detail.chapters[detail.chapters.length - 1].url)}`}>
                <Button variant="default" className="bg-blue-500 hover:bg-blue-600">First Chapter</Button>
              </Link>
              <Link href={`/view?url=${encodeURIComponent(detail.chapters[0].url)}`}>
                <Button variant="default" className="bg-blue-500 hover:bg-blue-600">Last Chapter</Button>
              </Link>
            </div>
          )}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {detail.chapters.slice().reverse().map((chapter, index) => (
              <Link key={index} href={`/view?url=${encodeURIComponent(chapter.url)}`}>
                <div className="w-full p-4 bg-white hover:bg-gray-100 transition-colors rounded-lg text-gray-900 border border-gray-200">
                  <div className="text-lg font-semibold text-gray-900">
                    Chapter {extractChapterNumber(chapter.title)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(chapter.title)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

