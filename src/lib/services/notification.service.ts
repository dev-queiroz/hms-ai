import { createClient } from '../supabase/server'
import { formatDateTime } from '../utils/date'

export type AppNotification = {
  id: string
  title: string
  message: string
  time: string
  type: string
  link: string
  read: boolean
}

export const notificationService = {
  async getRecentNotifications(professionalId?: string): Promise<AppNotification[]> {
    const supabase = await createClient()
    
    // Attempt to fetch from the persistent notifications table first
    const { data: user } = await supabase.auth.getUser()
    if (user?.user) {
      const { data: dbNotifications } = await (supabase
        .from('notifications') as any)
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (dbNotifications && dbNotifications.length > 0) {
        return dbNotifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: formatDateTime(n.created_at),
          type: n.type || 'system',
          link: n.link || '#',
          read: n.read
        }))
      }
    }

    // Fallback to dynamic events if table is empty or missing (backward compatibility)
    const notifications: AppNotification[] = []
    
    // ... (rest of old logic as fallback)
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)

    const { data: triagens } = await supabase
      .from('triagens')
      .select('id, data_hora, classificacao_risco, patients(nome)')
      .gte('data_hora', yesterday.toISOString())
      .order('data_hora', { ascending: false })
      .limit(5)

    if (triagens) {
      triagens.forEach((t: any) => {
        notifications.push({
          id: `triagem-${t.id}`,
          title: 'Nova Triagem Registrada',
          message: `Paciente ${t.patients?.nome || 'Desconhecido'} classificado como Risco: ${t.classificacao_risco}`,
          time: formatDateTime(t.data_hora),
          type: 'triagem',
          link: '/dashboard/triagens',
          read: false
        })
      })
    }
    
    return notifications
  },

  async markAsRead(notificationId: string): Promise<void> {
    const supabase = await createClient()
    
    // Only works for DB-backed notifications
    if (!notificationId.includes('-') || notificationId.length > 20) { // Simple check for UUID vs our composite IDs
       await (supabase
        .from('notifications') as any)
        .update({ read: true } as any)
        .eq('id', notificationId)
    }
  },

  async createNotification(data: { user_id: string; title: string; message: string; type: string; link: string }): Promise<void> {
    const supabase = await createClient()
    await (supabase.from('notifications') as any).insert([data] as any)
  }
}
