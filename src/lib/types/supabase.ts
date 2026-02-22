export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      professionals: {
        Row: {
          id: string
          user_id: string | null
          nome: string
          crm_coren: string
          especializacao: string | null
          unidade_saude: string | null
          cargo: string | null
          unidade_saude_id: string | null
          role: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          nome: string
          crm_coren: string
          especializacao?: string | null
          unidade_saude?: string | null
          cargo?: string | null
          unidade_saude_id?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          nome?: string
          crm_coren?: string
          especializacao?: string | null
          unidade_saude?: string | null
          cargo?: string | null
          unidade_saude_id?: string | null
          role?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string | null
          sus_number: string
          rg: string | null
          cpf: string
          nome: string
          data_nasc: string
          endereco: string
          contato: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          sus_number: string
          rg?: string | null
          cpf: string
          nome: string
          data_nasc: string
          endereco: string
          contato: string
        }
        Update: {
          id?: string
          user_id?: string | null
          sus_number?: string
          rg?: string | null
          cpf?: string
          nome?: string
          data_nasc?: string
          endereco?: string
          contato?: string
        }
      }
      agendamentos: {
        Row: {
          id: string
          patient_id: string | null
          professional_id: string | null
          data_hora: string
          tipo: string | null
          prioridade: boolean | null
          id_unidades_saude: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          data_hora: string
          tipo?: string | null
          prioridade?: boolean | null
          id_unidades_saude?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          data_hora?: string
          tipo?: string | null
          prioridade?: boolean | null
          id_unidades_saude?: string | null
        }
      }
      triagens: {
        Row: {
          id: string
          patient_id: string | null
          professional_id: string | null
          sinais_vitais: Json | null
          sintomas: string | null
          classificacao_risco: string | null
          data_hora: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          sinais_vitais?: Json | null
          sintomas?: string | null
          classificacao_risco?: string | null
          data_hora?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          sinais_vitais?: Json | null
          sintomas?: string | null
          classificacao_risco?: string | null
          data_hora?: string
        }
      }
      prontuarios: {
        Row: {
          id: string
          patient_id: string | null
          history: Json
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          history: Json
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          history?: Json
          updated_at?: string
        }
      }
      prescricoes: {
        Row: {
          id: string
          patient_id: string | null
          professional_id: string | null
          detalhes: Json | null
          data: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          detalhes?: Json | null
          data?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          detalhes?: Json | null
          data?: string
        }
      }
    }
  }
}
