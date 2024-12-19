'use client'
// ... (import statements and other code)
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import LinkList from './link-list'
import DomainList from './domain-list'
import CardUrlList from './card-url-list'


interface ApiResponse {
    links: string[];
    domains: string[];
    cardUrls: string[];
    error?: string;
}


export default function ScraperPage() {
  const [url, setUrl] = useState('')
  const [input, setInput] = useState('')
  const [links, setLinks] = useState<string[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [cardUrls, setCardUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')


  const handleSubmit = async (e: React.FormEvent, type: 'url' | 'input') => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setLinks([])
    setDomains([])
    setCardUrls([])

    try {
      const queryParams = type === 'url' 
        ? `url=${encodeURIComponent(url)}`
        : `input=${encodeURIComponent(input)}`
      
      const response = await fetch(`/api/scrape?${queryParams}`)
      const data: ApiResponse = await response.json()


      if (data.error) {
        setError(data.error)
      } else {
        setLinks(data.links)
        setDomains(data.domains)
        setCardUrls(data.cardUrls)
      }
    } catch (err) {
      setError('Failed to scrape the content')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Image Scraper</h1>
      
      <Tabs defaultValue="url" className="mb-8">
        <TabsList>
          <TabsTrigger value="url">URL Input</TabsTrigger>
          <TabsTrigger value="json">JSON Input</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <form onSubmit={(e) => handleSubmit(e, 'url')}>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter URL to scrape"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Scrape URL'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="json">
          <form onSubmit={(e) => handleSubmit(e, 'input')}>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste JavaScript/JSON content here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                required
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Parse Input'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Links</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkList links={links} />
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Card URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <CardUrlList cardUrls={cardUrls} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainList domains={domains} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

