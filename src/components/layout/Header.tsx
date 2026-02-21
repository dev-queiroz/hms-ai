'use client'

import { Bell, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1 flex justify-start">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Buscar pacientes, relatórios..." 
            className="w-full pl-9 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:ring-teal-500 rounded-full h-9"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 rounded-full">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </header>
  )
}
