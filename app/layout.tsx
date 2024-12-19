import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { LayoutContent } from './layout-content'
import { VisibilityProvider } from '@/contexts/VisibilityContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Manhwa Reader',
  description: 'A simple and clean Manhwa reader',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VisibilityProvider>
          <LayoutContent>{children}</LayoutContent>
        </VisibilityProvider>
      </body>
    </html>
  )
}

