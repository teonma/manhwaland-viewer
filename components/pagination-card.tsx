import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationCardProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function PaginationCard({
  currentPage,
  totalPages,
  onPageChange
}: PaginationCardProps) {
  const pageRange = 5; // Number of page buttons to show

  const generatePageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 overflow-x-auto pagination-mobile-friendly">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-2 py-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {currentPage > 3 && (
            <>
              <Button variant="outline" onClick={() => onPageChange(1)} className="px-3 py-1">
                1
              </Button>
              {currentPage > 4 && <span className="px-2">...</span>}
            </>
          )}

          {generatePageNumbers().map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(pageNumber)}
              className="px-3 py-1"
            >
              {pageNumber}
            </Button>
          ))}

          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2">...</span>}
              <Button variant="outline" onClick={() => onPageChange(totalPages)} className="px-3 py-1">
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2 py-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

