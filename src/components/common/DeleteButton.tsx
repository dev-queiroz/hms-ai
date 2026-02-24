'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteButtonProps {
  id: string
  action: (id: string) => Promise<{ success?: boolean; error?: string }>
  title?: string
  description?: string
}

export function DeleteButton({ 
  id, 
  action, 
  title = "Você tem certeza?", 
  description = "Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro e removerá seus dados de nossos servidores." 
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await action(id)
    if (result.error) {
      toast.error('Erro ao excluir', { description: result.error })
    } else {
      toast.success('Excluído com sucesso!')
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-red-100 hover:text-red-600 transition-colors">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-slate-200">
            Cancelar
          </AlertDialogCancel>
          <Button onClick={handleDelete} disabled={loading} className="bg-red-600 text-white hover:bg-red-700">
            {loading ? <LoadingSpinner className="h-4 w-4 text-white" /> : "Sim, Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
