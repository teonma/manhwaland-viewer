'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchForm() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/series?search=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search series..."
      />
      <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Search</Button>
    </form>
  )
}

