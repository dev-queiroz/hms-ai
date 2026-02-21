'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Hospital, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { registerAdminAction } from '@/actions/register'
import { FormError } from '@/components/common/FormError'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function RegisterAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await registerAdminAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro no Registro', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Administrador registrado!', { description: 'Você já pode fazer login no sistema.' })
      router.push('/login')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm gap-8 relative z-10">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 bg-teal-500/10 rounded-2xl ring-1 ring-teal-500/30">
          <ShieldCheck className="w-8 h-8 text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Setup Administrativo</h1>
        <p className="text-sm text-slate-400">
          Crie a primeira conta de Administrador do sistema Hospital IA.
        </p>
      </div>

      <Card className="w-full bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Novo Administrador</CardTitle>
          <CardDescription className="text-slate-400">
            É necessária a chave de configuração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Nome Completo</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="Dr. João Silva" 
                required 
                className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Corporativo</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@hospital.com" 
                required 
                className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha Master</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" 
              />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <Label htmlFor="adminSecret" className="text-rose-400">Chave Secreta de Ambiente (ADMIN_SECRET)</Label>
              <Input 
                id="adminSecret" 
                name="adminSecret" 
                type="password" 
                required 
                className="bg-rose-950/20 border-rose-900/50 text-slate-200 placeholder:text-slate-500 focus-visible:ring-rose-500" 
              />
            </div>

            <FormError message={error || undefined} />

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20" disabled={loading}>
              {loading ? <LoadingSpinner className="text-white" /> : 'Criar Conta de Admin'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4">
          <Link href="/login" className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Voltar para o Login
          </Link>
        </CardFooter>
      </Card>
      
      <p className="text-xs text-slate-500 text-center max-w-xs">
        Para fins de desenvolvimento, a chave <code className="text-rose-400 bg-rose-400/10 px-1 py-0.5 rounded">ADMIN_SECRET</code> pode ser encontrada no seu arquivo <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">.env</code>.
      </p>
    </div>
  )
}
