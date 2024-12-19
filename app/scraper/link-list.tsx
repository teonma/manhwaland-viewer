import { ScrollArea } from "@/components/ui/scroll-area"

interface LinkListProps {
  links: string[]
}

export default function LinkList({ links }: LinkListProps) {
  return (
    <ScrollArea className="h-[300px]">
      {links.length > 0 ? (
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index} className="break-all">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {link}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No links found</p>
      )}
    </ScrollArea>
  )
}

