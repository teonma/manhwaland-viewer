import { Suspense } from 'react'
import SeriesList from './series-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import SearchForm from './search-form'

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Search</CardTitle>
          <CardDescription>
            Find your favorite series instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchForm />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Browse Series</CardTitle>
          <CardDescription>Discover new and popular manhwa series</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SeriesGridSkeleton />}>
            <SeriesList page="1" type="manhwa" order="update" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function SeriesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden">
          <Skeleton className="aspect-[2/3] w-full" />
          <CardHeader className="p-4">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow">
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

