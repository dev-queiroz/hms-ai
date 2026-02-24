'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-slate-500">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100"
          onClick={() => router.push(createPageUrl(1))}
          disabled={currentPage <= 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100"
          onClick={() => router.push(createPageUrl(currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center text-sm font-medium text-slate-200 min-w-[32px]">
          {currentPage}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100"
          onClick={() => router.push(createPageUrl(currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100"
          onClick={() => router.push(createPageUrl(totalPages))}
          disabled={currentPage >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
