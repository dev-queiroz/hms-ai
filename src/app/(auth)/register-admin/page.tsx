import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: 'Registro de Admin | Hospital IA',
}

export default function RegisterAdminPage() {
  return (
    <Card className="w-full border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl text-slate-100">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Novo Administrador</CardTitle>
        <CardDescription className="text-slate-400">
          Esta rota deve ser protegida e acessível apenas por super-usuários futuramente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300 text-center">
          O formulário de registro de administradores será implementado aqui.
        </p>
        <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white">
          <Link href="/login">Voltar ao Login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
