'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SeriesCard from '@/components/series-card'
import PaginationCard from '@/components/pagination-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import './series.css'

interface Series {
  title: string
  url: string
  thumbnail: string
  type: string
  chapter: string
  rating: string
}

interface SeriesListProps {
  page: string;
  type: string;
  order: string;
}

export default function SeriesList({ page: initialPage, type: initialType, order: initialOrder }: SeriesListProps) {
  const [series, setSeries] = useState<Series[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(parseInt(initialPage));
  const [type, setType] = useState(initialType);
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState('all');
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    const fetchSeries = async () => {
      setIsLoading(true)
      setError('')

      try {
        let url = searchQuery
          ? `/api/search?query=${encodeURIComponent(searchQuery)}`
          : `/api/fetch-series?page=${page}&type=${type}&order=${order}&status=${status}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setSeries(searchQuery ? data.results : data.series);
        }
      } catch (err) {
        setError('Failed to fetch series: ' + err);
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSeries();
  }, [page, type, order, status, searchQuery])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= 50) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1)
  }

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder)
    setPage(1)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }

  if (error) {
    return <div className="text-center text-red-500 my-8">{error}</div>
  }

  if (isLoading) {
    return <div className="text-center text-gray-500 my-8">Loading...</div>;
  }

  if (series.length === 0) {
    return <div className="text-center text-gray-500 my-8">No series found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className='flex flex-col sm:flex-row gap-4 sm:items-end'>
        <div className='space-y-2'>
          <Label htmlFor="type-select">Type</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type-select" className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manhwa">Manhwa</SelectItem>
              <SelectItem value="manga">Manga</SelectItem>
              <SelectItem value="manhua">Manhua</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor="order-select">Order</Label>
          <Select value={order} onValueChange={handleOrderChange}>
            <SelectTrigger id="order-select" className="w-[180px]">
              <SelectValue placeholder="Select order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update">Latest Update</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor="status-select">Status</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-select" className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {series.map((item, index) => (
          <SeriesCard key={`${item.url}-${index}`} {...item} />
        ))}
      </div>

      <div className="py-8">
        <PaginationCard
          currentPage={page}
          totalPages={50}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

