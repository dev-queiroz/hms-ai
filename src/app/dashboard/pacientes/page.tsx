import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Search, User, ChevronLeft, ChevronRight } from "lucide-react"
import { pacienteService } from "@/lib/services/paciente.service"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import { Pagination } from "@/components/common/Pagination"
import { DeleteButton } from "@/components/common/DeleteButton"
import { deletePacienteAction } from "@/actions/paciente"
import { Pencil } from "lucide-react"

export const metadata = {
  title: 'Pacientes | Hospital IA',
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function PacientesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page) || 1
  const search = resolvedParams.search || ''
  const limit = 10

  const { data: pacientes, count } = await pacienteService.getPacientes(page, limit, search)
  const totalPages = Math.ceil(count / limit)

  // Função helper para manter os search params nas URLs
  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (newPage > 1) params.set('page', newPage.toString())
    if (search) params.set('search', search)
    return `/dashboard/pacientes?${params.toString()}`
  }

  async function handleSearch(formData: FormData) {
    'use server'
    const searchTerm = formData.get('search') as string
    if (searchTerm) {
      redirect(`/dashboard/pacientes?search=${encodeURIComponent(searchTerm)}`)
    } else {
      redirect(`/dashboard/pacientes`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Pacientes</h1>
          <p className="text-slate-400">Gerencie todos os pacientes registrados na unidade.</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
          <Link href="/dashboard/pacientes/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-slate-200">Lista de Pacientes ({count})</CardTitle>
          <form action={handleSearch} className="flex relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input 
              name="search"
              defaultValue={search}
              placeholder="Buscar por nome ou CPF..." 
              className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200" 
            />
            <Button type="submit" className="sr-only">Buscar</Button>
          </form>
        </CardHeader>
        <CardContent>
          {pacientes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center">
              <User className="w-12 h-12 mb-4 text-slate-600" />
              <p>Nenhum paciente encontrado.</p>
              {search && <p className="text-sm mt-1">Tente remover o filtro de busca.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                    <tr>
                      <th scope="col" className="px-6 py-3 rounded-tl-lg">Nome</th>
                      <th scope="col" className="px-6 py-3">CPF</th>
                      <th scope="col" className="px-6 py-3">Data Nasc.</th>
                      <th scope="col" className="px-6 py-3 rounded-tr-lg">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map((paciente) => (
                      <tr key={paciente.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-200">{paciente.nome}</td>
                        <td className="px-6 py-4">{paciente.cpf}</td>
                        <td className="px-6 py-4">{new Date(paciente.data_nasc).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Link href={`/dashboard/pacientes/${paciente.id}`} className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                              Ver Prontuário
                            </Link>
                            <Link href={`/dashboard/pacientes/${paciente.id}/editar`} className="text-slate-400 hover:text-indigo-400 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <DeleteButton 
                              id={paciente.id} 
                              action={deletePacienteAction} 
                              title="Excluir Paciente?"
                              description={`Esta ação removerá permanentemente o registro de ${paciente.nome} e todo seu histórico clínico.`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination UI */}
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
