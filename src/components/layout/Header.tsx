'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getNotificationsAction, markNotificationAsReadAction } from '@/actions/notification'
import type { AppNotification } from '@/lib/services/notification.service'

export function Header({ initialProfessional }: { initialProfessional?: { nome: string; cargo: string | null } | null }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [professional, setProfessional] = useState<{ id?: string, nome: string; cargo: string | null } | null>(initialProfessional || null)
  const [notifications, setNotifications] = useState<AppNotification[]>([])

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

  useEffect(() => {
    async function loadNotifications() {
      // Only fetch if we have a resolved professional id or just try generally
      const data = await getNotificationsAction(professional?.id)
      setNotifications(data || [])
    }
    loadNotifications()
    // Optional: setup interval to poll here
  }, [professional?.id])

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
        <div className="relative">
          <Button 
            onClick={() => { setShowNotif(!showNotif); setShowMenu(false) }}
            variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100 rounded-full"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </Button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <p className="text-sm font-semibold text-slate-200">Notificações</p>
                {notifications.some(n => !n.read) && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                    {notifications.filter(n => !n.read).length} novas
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  notifications.map(n => (
                    <Link 
                      key={n.id} 
                      href={n.link}
                      onClick={async () => { 
                        setShowNotif(false); 
                        if (!n.read) {
                          await markNotificationAsReadAction(n.id);
                          setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                        }
                      }}
                      className={`block p-3 border-b border-slate-800/50 hover:bg-slate-800 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-medium ${!n.read ? 'text-slate-100' : 'text-slate-400'}`}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowNotif(false) }}
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

      {/* Overlay para fechar menus */}
      {(showMenu || showNotif) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowNotif(false) }} />
      )}
    </header>
  )
}
