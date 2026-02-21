import { redirect } from "next/navigation"

// Rota inicial redirecionando para login
export default function Home() {
  redirect("/login")
}
