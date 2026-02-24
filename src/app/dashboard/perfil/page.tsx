'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, Mail, Shield, Building, Stethoscope, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: prof } = await supabase
          .from('professionals')
          .select('*, unidades_saude(nome)')
          .eq('user_id', user.id)
          .single()
        
        setProfile(prof)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome') as string
    const cargo = formData.get('cargo') as string
    const especializacao = formData.get('especializacao') as string

    const supabase = createClient()
    
    if (!user) {
      toast.error('Erro: Usuário não identificado. Recarregue a página.')
      setSaving(false)
      return
    }

    const { error } = await (supabase
      .from('professionals') as any)
      .update({
        nome,
        cargo,
        especializacao,
      })
      .eq('user_id', user.id)

    if (error) {
      toast.error('Erro ao atualizar perfil', { description: error.message })
    } else {
      toast.success('Perfil atualizado com sucesso!')
      setProfile((prev: any) => ({ ...prev, nome, cargo, especializacao } as any))
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-400">
        Perfil não encontrado.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Meu Perfil</h1>
        <p className="text-slate-400">Gerencie suas informações profissionais e dados de acesso.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">{profile.nome}</h2>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">{profile.role}</p>
            <div className="mt-4 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs text-teal-400">
              {profile.cargo || 'Profissional de Saúde'}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Informações Pessoais</CardTitle>
            <CardDescription className="text-slate-400">Esses dados são visíveis para outros profissionais da unidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-300">Nome Completo</Label>
                  <Input name="nome" id="nome" defaultValue={profile.nome} className="bg-slate-800/50 border-slate-700 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email de Acesso</Label>
                  <Input id="email" value={user?.email} disabled className="bg-slate-800/20 border-slate-700 text-slate-500 opacity-70" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="crm_coren" className="text-slate-300">Registro (CRM/COREN)</Label>
                  <Input id="crm_coren" value={profile.crm_coren} disabled className="bg-slate-800/20 border-slate-700 text-slate-500 opacity-70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo" className="text-slate-300">Cargo</Label>
                  <Input name="cargo" id="cargo" defaultValue={profile.cargo} placeholder="Ex: Médico Intensivista" className="bg-slate-800/50 border-slate-700 text-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="especializacao" className="text-slate-300">Especialização</Label>
                <Input name="especializacao" id="especializacao" defaultValue={profile.especializacao} placeholder="Ex: Cardiologia" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {saving ? <LoadingSpinner className="mr-2" /> : null}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Vínculos Institucionais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <Building className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Unidade Ativa</p>
                <p className="text-sm text-slate-200">{profile.unidades_saude?.nome || 'Não vinculada'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <Shield className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Nível de Acesso</p>
                <p className="text-sm text-slate-200 uppercase">{profile.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
