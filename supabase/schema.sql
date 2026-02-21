-- ==========================================
-- Hospital IA - Supabase SQL Schema
-- ==========================================

-- 1. Enums
CREATE TYPE user_role AS ENUM ('ADMINISTRADOR_PRINCIPAL', 'MEDICO', 'ENFERMEIRO');
CREATE TYPE risco_triagem AS ENUM ('AZUL', 'VERDE', 'AMARELO', 'LARANJA', 'VERMELHO');
CREATE TYPE tipo_relatorio_ia AS ENUM ('SURTO', 'PRONTUARIO');

-- 2. Tables

-- Tabela de Funcionários (Estende auth.users do Supabase)
CREATE TABLE public.funcionario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'ENFERMEIRO',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Pacientes
CREATE TABLE public.paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    genero TEXT NOT NULL,
    contato TEXT,
    historico_medico TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Triagens
CREATE TABLE public.triagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.paciente(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES public.funcionario(id),
    sintomas TEXT NOT NULL,
    pressao_arterial TEXT,
    temperatura DECIMAL(4,1),
    frequencia_cardiaca INTEGER,
    saturacao_oxigenio INTEGER,
    nivel_dor INTEGER CHECK (nivel_dor >= 0 AND nivel_dor <= 10),
    risco risco_triagem NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Relatórios da IA
CREATE TABLE public.relatorio_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.paciente(id) ON DELETE CASCADE,
    triagem_id UUID REFERENCES public.triagem(id) ON DELETE CASCADE,
    tipo tipo_relatorio_ia NOT NULL,
    conteudo JSONB NOT NULL,
    gerado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Row Level Security (RLS)
-- Enable RLS em todas as tabelas
ALTER TABLE public.funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorio_ia ENABLE ROW LEVEL SECURITY;

-- Políticas Simples (Para desenvolvimento: usuários logados podem ler/escrever tudo)
-- IMPORTANTE: Em produção, o ideal é restringir por Role e Instituição.
CREATE POLICY "Logados Podem Ver Funcionarios" ON public.funcionario FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins Podem Inserir Funcionarios" ON public.funcionario FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.funcionario f WHERE f.id = auth.uid() AND f.role = 'ADMINISTRADOR_PRINCIPAL')
);

CREATE POLICY "Logados Podem Tudo em Pacientes" ON public.paciente FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logados Podem Tudo em Triagens" ON public.triagem FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logados Podem Tudo em Relatorios" ON public.relatorio_ia FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Triggers (Updated At para Paciente)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paciente_modtime
    BEFORE UPDATE ON public.paciente
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- Dumps Locais (Apenas para Testes/Mock, ignore em Prod)
-- ==========================================
-- Como auth.users é gerido pelo supabase auth, a inserção local na tabela `funcionario`
-- requer que o usuário já exista lá. O ideal é criar o primeiro usuário pelo dashboard
-- Supabase, copiar o UUID gerado em auth.users e rodar:
-- INSERT INTO public.funcionario (id, nome, role) VALUES ('<UUID_COPIADO>', 'Admin Supabase', 'ADMINISTRADOR_PRINCIPAL');
