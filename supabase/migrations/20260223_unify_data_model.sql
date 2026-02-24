-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Standardize Roles (unifying the two approaches)
-- We will use the more granular roles but keep compatibility.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMINISTRADOR_PRINCIPAL', 'MEDICO', 'ENFERMEIRO', 'TECNICO', 'RECEPCIONISTA');
    END IF;
END $$;

-- 3. Update professionals table to align with the proposed model
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Convert role column to use the enum if preferred, or just keep as text for flexibility but enforce values.
-- For now, let's keep it as text to avoid breaking existing code that might use 'admin'/'professional', 
-- but we will migrate the values.

-- 4. Migration Data from funcionario to professionals (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'funcionario') THEN
        INSERT INTO public.professionals (id, user_id, nome, role, ativo, created_at)
        SELECT id, id, nome, role::text, ativo, created_at
        FROM public.funcionario
        ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            role = EXCLUDED.role,
            ativo = EXCLUDED.ativo;
        
        -- 5. Drop redundant table
        DROP TABLE IF EXISTS public.funcionario CASCADE;
    END IF;
END $$;

-- 6. Add unidade_id consistency
-- Already present as unidade_saude_id in professionals. 
-- Let's ensure other tables have it.

-- Ensure patients has unidade_id if isolation is needed per unit (optional based on requirements)
-- ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS unidade_saude_id UUID REFERENCES public.unidades_saude(id);

-- 7. Reset RLS and Policies
-- First, enable RLS on everything
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_saude ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 8. Create New Restrictive Policies

-- Professionals: Can read all professionals (for lookup), but only edit their own.
CREATE POLICY "Professionals can read all professionals" ON public.professionals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professionals can update own profile" ON public.professionals FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Patients: Authenticated users can read/write (for now, will restrict by unit later)
CREATE POLICY "Authenticated can manage patients" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Agendamentos, Triagens, Prontuarios, Prescricoes:
-- For now, allow authenticated professionals to manage these.
-- Ideally restrict to those in the same unidade_saude_id.
CREATE POLICY "Professionals can manage agendamentos" ON public.agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Professionals can manage triagens" ON public.triagens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Professionals can manage prontuarios" ON public.prontuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Professionals can manage prescricoes" ON public.prescricoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Unidades Saude: Everyone can read, only Admins can write
CREATE POLICY "Anyone can read unidades" ON public.unidades_saude FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage unidades" ON public.unidades_saude FOR ALL TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.professionals WHERE user_id = auth.uid() AND role IN ('ADMINISTRADOR_PRINCIPAL', 'admin'))
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.professionals WHERE user_id = auth.uid() AND role IN ('ADMINISTRADOR_PRINCIPAL', 'admin'))
);
