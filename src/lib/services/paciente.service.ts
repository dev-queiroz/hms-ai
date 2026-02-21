/**
 * Serviço de gerenciamento de pacientes (Placeholder)
 * Aqui ficarão as chamadas ao Supabase para consultas e mutações complexas.
 */

export const pacienteService = {
  async getPacientes() {
    return []
  },
  
  async getPacienteById(id: string) {
    return null
  },

  async createPaciente(data: any) {
    return { id: 'new-id', ...data }
  },

  async updatePaciente(id: string, data: any) {
    return { id, ...data }
  },

  async deletePaciente(id: string) {
    return true
  }
}
