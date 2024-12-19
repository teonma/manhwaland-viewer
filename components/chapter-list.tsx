import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChapterListProps {
  isOpen: boolean
  onClose: () => void
  currentChapter: number | null
  lastChapter: number | null
  onChapterSelect: (chapter: number) => void
}

const ChapterList: React.FC<ChapterListProps> = ({
  isOpen,
  onClose,
  currentChapter,
  lastChapter,
  onChapterSelect,
}) => {
  if (lastChapter === null) return null;

  const chapters = Array.from({ length: lastChapter }, (_, i) => i + 1).reverse();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Chapters</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
          <div className="grid grid-cols-3 gap-2">
            {chapters.map((chapter) => (
              <Button
                key={chapter}
                variant={currentChapter === chapter ? "default" : "outline"}
                onClick={() => {
                  onChapterSelect(chapter)
                  onClose()
                }}
                className="w-full"
              >
                {chapter}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default ChapterList

