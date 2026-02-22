import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px] bg-slate-800" />
        <Skeleton className="h-4 w-[350px] bg-slate-800" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-slate-900 border border-slate-800" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-full lg:col-span-4 h-96 bg-slate-900 rounded-xl border border-slate-800" />
        <Skeleton className="col-span-full lg:col-span-3 h-96 bg-slate-900 rounded-xl border border-slate-800" />
      </div>
    </div>
  )
}
