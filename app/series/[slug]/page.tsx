import { Metadata } from 'next';
import { Suspense } from 'react';
import ManhwaDetail from './manhwa-detail';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
      title: `${params.slug.replace(/-/g, ' ')} - Manhwa Reader`,
    };
}

export default function ManhwaDetailPage({ params }: Props) {
    const { slug } = params;

    return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold capitalize">{slug.replace(/-/g, ' ')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SeriesDetailSkeleton />}>
                <ManhwaDetail slug={slug} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
    )
}

function SeriesDetailSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='w-full h-52'/>
      <Skeleton className='w-1/2 h-4'/>
      <Skeleton className='w-full h-4'/>
      <Skeleton className='w-full h-4'/>
      <Skeleton className='w-full h-4'/>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[2/3] w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

