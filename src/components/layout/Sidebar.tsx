'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { 
  Users, 
  LayoutDashboard, 
  Brain, 
  LogOut,
  Settings
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Pacientes',
    href: '/dashboard/pacientes',
    icon: Users,
  },
  {
    title: 'Inteligência Artificial',
    href: '/dashboard/ia',
    icon: Brain,
  }
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await logoutAction()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold">H</span>
          </div>
          <span className="text-lg font-bold text-slate-100 hidden sm:block">Hospital IA</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive 
                  ? "bg-slate-800 text-teal-400 font-medium" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-teal-400" : "text-slate-400")} />
              {item.title}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair do Sistema
        </Button>
      </div>
    </aside>
  )
}
