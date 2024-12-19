import { ScrollArea } from "@/components/ui/scroll-area"

interface DomainListProps {
  domains: string[]
}

export default function DomainList({ domains }: DomainListProps) {
  return (
    <ScrollArea className="h-[300px]">
      {domains.length > 0 ? (
        <ul className="space-y-2">
          {domains.map((domain, index) => (
            <li key={index} className="break-all">
              {domain}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No domains found</p>
      )}
    </ScrollArea>
  )
}

