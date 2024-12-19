import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, CircleDot } from 'lucide-react'

interface SeriesCardProps {
  title: string
  url: string
  thumbnail: string
  type: string
  chapter: string
  rating: string
  status: string
}

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function SeriesCard({
  title,
  url,
  thumbnail,
  type,
  chapter,
  rating,
  status,
}: SeriesCardProps) {
  // Extract slug from the URL
  const urlParts = url.split('/');
  let slug = '';
  // Find the second-to-last part which is most likely the slug
  if (urlParts.length >= 3) {
    slug = urlParts[urlParts.length - 2];
    // Remove any '-chapter' suffixes if it's a chapter link
    slug = slug.split('-chapter-')[0];
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={thumbnail || placeholder}
          alt={title}
          fill
          className='object-cover'
          placeholder="blur"
          blurDataURL={placeholder}
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
          {type}
        </div>
        {rating && (
          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {rating}
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground">Latest: {chapter}</p>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <CircleDot className="w-3 h-3" />
          {status === "Completed" ? "Completed" : "Ongoing"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/series/${slug}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

