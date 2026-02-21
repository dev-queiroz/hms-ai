'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginAction } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FormError } from '@/components/common/FormError'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginValues) => {
    setError(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await loginAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro no login', { description: result.error })
    } else if (result.success) {
      toast.success('Login bem sucedido', { description: 'Redirecionando...' })
      router.push('/dashboard')
    }
  }

  return (
    <Card className="w-full border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl text-slate-100">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-white font-bold text-xl">H</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
        <CardDescription className="text-slate-400">
          Entre com suas credenciais para acessar o Hospital IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu.nome@hospital.com" 
              className="bg-slate-800/50 border-slate-700 focus-visible:ring-teal-500 text-slate-200 placeholder:text-slate-500"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">Senha</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="bg-slate-800/50 border-slate-700 focus-visible:ring-teal-500 text-slate-200 placeholder:text-slate-500"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <FormError message={error || undefined} />

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0 transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner className="text-white" /> : 'Entrar na Plataforma'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
