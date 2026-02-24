import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getHeaderUserInfoAction } from '@/actions/auth'
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Executa server-side para garantir que o user ta logado e pegar infos
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  // Fetch user info for the header to avoid client-side waterfall
  const professional = await getHeaderUserInfoAction()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <Header initialProfessional={professional as any} />
        <main className="flex-1 overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
