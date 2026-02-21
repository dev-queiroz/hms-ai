import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { requireAuth } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Executa server-side para garantir que o user ta logado. O middleware barra rotas, mas por precaução:
  await requireAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
