# ⚠️ ATUALIZAÇÃO IMPORTANTE: Perfil Criado Apenas Após Confirmação

## 🎯 Mudança Implementada

O sistema foi atualizado para criar perfis na tabela `profiles` **APENAS** depois que o usuário confirmar o email.

## 📋 Como Funciona Agora:

### Antes (Antigo):
```
1. Usuário se registra → signUp()
   ↓
2. Criado em auth.users com email_confirmed_at = NULL
   ↓
3. Trigger cria perfil imediatamente na tabela profiles ❌
   ↓
4. Perfil fica "inativo" até confirmação
   ↓
5. Se usuário nunca confirmar → Perfil "fantasma" no banco
```

### Agora (Novo):
```
1. Usuário se registra → signUp()
   ↓
2. Criado em auth.users com email_confirmed_at = NULL
   ↓
3. Trigger NÃO cria perfil ainda ✓
   ↓
4. Usuário confirma email no link
   ↓
5. email_confirmed_at é preenchido com timestamp
   ↓
6. Trigger on_auth_user_confirmed detecta mudança
   ↓
7. Perfil é criado na tabela profiles ✓
```

## 🔧 SQL Atualizado (Execute no Supabase):

```sql
-- Função para criar perfil automaticamente quando usuário confirma email
-- MODIFICADO: Só cria perfil APÓS confirmação do email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_birth_date DATE;
  v_age INTEGER;
  v_city TEXT;
  v_state TEXT;
  v_whatsapp TEXT;
BEGIN
  -- Só criar perfil se o email já foi confirmado
  -- Isso evita criar perfis para contas que nunca serão ativadas
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Extrair valores dos metadados com valores padrão
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário');
  v_birth_date := COALESCE(
    (NEW.raw_user_meta_data->>'birth_date')::date, 
    CURRENT_DATE - INTERVAL '18 years'
  );
  v_age := COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18);
  v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Não informado');
  v_state := COALESCE(NEW.raw_user_meta_data->>'state', 'SP');
  v_whatsapp := COALESCE(NEW.raw_user_meta_data->>'whatsapp', '');

  -- Inserir perfil
  INSERT INTO public.profiles (
    id, email, full_name, birth_date, age, city, state, whatsapp
  )
  VALUES (
    NEW.id, NEW.email, v_full_name, v_birth_date, 
    v_age, v_city, v_state, v_whatsapp
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Criar trigger que só executa APÓS confirmação do email
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();
```

## ✅ Vantagens:

1. **Banco de dados limpo** - Sem perfis de emails não confirmados
2. **Mais seguro** - Evita spam/abuse de criação de contas
3. **Melhor performance** - Menos registros na tabela profiles
4. **Compliance** - Apenas usuários verificados têm dados armazenados

## 🚀 Como Aplicar:

1. Abra o **Supabase Dashboard** → **SQL Editor**
2. Cole e execute o SQL acima
3. Verifique que o trigger foi criado:
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'auth';
   ```
4. Deve retornar: `on_auth_user_confirmed | UPDATE | users`

## 🧪 Como Testar:

1. Crie uma nova conta na aplicação
2. Verifique em **Authentication** → **Users** - usuário aparece mas sem perfil
3. Verifique em **Table Editor** → **profiles** - tabela vazia
4. Confirme o email clicando no link
5. Volte para **Table Editor** → **profiles** - agora o perfil existe! ✓

## ⚠️ Observações:

- Usuários criados ANTES dessa atualização que já têm perfil não são afetados
- Usuários criados ANTES que nunca confirmaram não terão perfil criado automaticamente
- Se necessário, você pode criar perfis manualmente via SQL ou aguardar que eles confirmem
