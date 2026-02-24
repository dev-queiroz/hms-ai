'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function Header({ initialProfessional }: { initialProfessional?: { nome: string; cargo: string | null } | null }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [professional, setProfessional] = useState<{ nome: string; cargo: string | null } | null>(initialProfessional || null)

  useEffect(() => {
    // Se já veio de props (do layout), não faz o fetch inicial
    if (initialProfessional && !professional) {
       setProfessional(initialProfessional)
    }

    if (professional) return; // Se já tem dados, não busca

    async function loadUser() {
      const { getHeaderUserInfoAction } = await import('@/actions/auth')
      const data = await getHeaderUserInfoAction()
      if (data) setProfessional(data as any)
    }
    loadUser()
  }, [initialProfessional, professional])

  const handleLogout = async () => {
    await logoutAction()
    toast.success('Sessão encerrada.')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 rounded-full">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-none">
                {professional?.nome || 'Profissional'}
              </p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                {professional?.cargo || 'Carregando...'}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200">{professional?.nome || '—'}</p>
                <p className="text-[10px] text-slate-500">{professional?.cargo || '—'}</p>
              </div>
              <Link
                href="/dashboard/perfil"
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </header>
  )
}
