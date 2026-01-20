-- Script para configurar as políticas de RLS (Row Level Security) no Supabase
-- Permite que todos os administradores visualizem todos os perfis de usuários

-- Primeiro, remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Política para permitir que administradores vejam todos os perfis
CREATE POLICY "Admin can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid() 
    AND current_user_profile.is_admin = true
  )
);

-- Política para permitir que administradores atualizem perfis
CREATE POLICY "Admin can update profiles" ON profiles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid() 
    AND current_user_profile.is_admin = true
  )
);

-- Política para permitir que administradores excluam perfis
CREATE POLICY "Admin can delete profiles" ON profiles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid() 
    AND current_user_profile.is_admin = true
  )
);

-- Política para permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Política para permitir que usuários insiram seu próprio perfil (trigger)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para permitir que administradores insiram perfis
CREATE POLICY "Admin can insert profiles" ON profiles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid() 
    AND current_user_profile.is_admin = true
  )
);