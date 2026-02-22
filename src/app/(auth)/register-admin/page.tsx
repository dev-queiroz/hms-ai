'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
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
  const [role, setRole] = useState('professional')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    const result = await registerAdminAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro no Registro', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Profissional cadastrado!', { description: 'Login disponível assim que o e-mail for confirmado.' })
      router.push('/dashboard/professionals')
    }
  }

  const roles = [
    { value: 'professional', label: 'Profissional' },
    { value: 'admin', label: 'Administrador' },
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 relative z-10">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 bg-teal-500/10 rounded-2xl ring-1 ring-teal-500/30">
          <ShieldCheck className="w-8 h-8 text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Cadastro de Profissional</h1>
        <p className="text-sm text-slate-400">
          Registre médicos, enfermeiros ou administradores no sistema.
        </p>
      </div>

      <Card className="w-full bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Novo Profissional</CardTitle>
          <CardDescription className="text-slate-400">
            Preencha os dados completos do profissional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="text-slate-300">Tipo de Profissional</Label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      role === r.value
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Nome Completo *</Label>
              <Input id="fullName" name="fullName" placeholder="Dr. João Silva" required className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="crm_coren" className="text-slate-300">CRM / COREN *</Label>
                <Input id="crm_coren" name="crm_coren" placeholder="CRM-SP 123456" required className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo" className="text-slate-300">Cargo</Label>
                <Input id="cargo" name="cargo" placeholder="Ex: Clínico Geral" className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="especializacao" className="text-slate-300">Especialização</Label>
              <Input id="especializacao" name="especializacao" placeholder="Ex: Cardiologia, Pediatria..." className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" />
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-800">
              <Label htmlFor="email" className="text-slate-300">E-mail de Acesso *</Label>
              <Input id="email" name="email" type="email" placeholder="profissional@hospital.com" required className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha Inicial *</Label>
              <Input id="password" name="password" type="password" required placeholder="Mínimo 6 caracteres" className="bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500" />
            </div>

            {role === 'admin' && (
              <div className="space-y-2 p-3 bg-rose-950/20 border border-rose-800/30 rounded-lg">
                <Label htmlFor="adminSecret" className="text-rose-400">Chave Secreta de Ambiente (ADMIN_SECRET) *</Label>
                <Input id="adminSecret" name="adminSecret" type="password" required className="bg-rose-950/20 border-rose-900/50 text-slate-200 placeholder:text-slate-500 focus-visible:ring-rose-500" />
                <p className="text-[11px] text-rose-400/70">Necessária apenas para criar contas de Administrador.</p>
              </div>
            )}

            <FormError message={error || undefined} />

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20" disabled={loading}>
              {loading ? <LoadingSpinner className="text-white" /> : 'Cadastrar Profissional'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4">
          <Link href="/login" className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Voltar para o Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
