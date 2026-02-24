'use server'

import { notificationService } from '@/lib/services/notification.service'
import { createClient } from '@/lib/supabase/server'

export async function getNotificationsAction(professionalId?: string) {
  try {
    return await notificationService.getRecentNotifications(professionalId)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    await notificationService.markAsRead(notificationId)
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { error: 'Falha ao atualizar notificação' }
  }
}
