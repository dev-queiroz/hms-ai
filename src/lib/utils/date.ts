/**
 * Formata uma data para o timezone de Brasília (America/Sao_Paulo, UTC-3).
 * Usado em toda a aplicação para garantir consistência nos horários.
 */
const BR_LOCALE = 'pt-BR'
const BR_TIMEZONE = 'America/Sao_Paulo'

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString(BR_LOCALE, {
      timeZone: BR_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleString(BR_LOCALE, {
      timeZone: BR_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}
