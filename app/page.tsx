'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, List, Github } from 'lucide-react'

interface LastRead {
  title: string;
  chapter: number;
  url: string;
}

const capitalizeTitle = (title: string) => {
  return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function Home() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    const cachedData = localStorage.getItem('manhwaViewerCache');
    if (cachedData) {
      const { title, currentChapter, baseUrl } = JSON.parse(cachedData);
      setLastRead({
        title,
        chapter: currentChapter,
        url: `${baseUrl}/${title.toLowerCase().replace(/ /g, '-')}-chapter-${currentChapter.toString().padStart(2, '0')}/`
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Browse Series
            </CardTitle>
            <CardDescription>Discover new and popular manhwa series</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore our vast collection of manhwa series, filtered by genre, popularity, and latest updates.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/series" className="w-full">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Browse Now</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Quick Search
            </CardTitle>
            <CardDescription>Find your favorite series instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex space-x-2" action="/series" method="GET">
              <Input name="search" placeholder="Search series..." />
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Search</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Continue Reading
            </CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            {lastRead ? (
              <p className="text-sm text-muted-foreground mb-4">
                You were reading <strong>{capitalizeTitle(lastRead.title)}</strong> - Chapter {lastRead.chapter}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                You haven't started reading any series yet. Browse our collection to get started!
              </p>
            )}
          </CardContent>
          <CardFooter>
            {lastRead ? (
              <Link href={`/view?url=${encodeURIComponent(lastRead.url)}`} className="w-full">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" variant="secondary">Continue Reading</Button>
              </Link>
            ) : (
              <Link href="/series" className="w-full">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" variant="secondary">Browse Series</Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Open Source
            </CardTitle>
            <CardDescription>This project is available on GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contribute to the project, report issues, or suggest new features to help improve the Manhwa Reader.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" variant="outline">View on GitHub</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

