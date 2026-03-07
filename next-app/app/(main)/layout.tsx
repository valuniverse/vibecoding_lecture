import Link from 'next/link'
import { Home, History } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="mx-auto flex max-w-md justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Home className="h-5 w-5" />
            홈
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <History className="h-5 w-5" />
            기록
          </Link>
        </div>
      </nav>
    </div>
  )
}
