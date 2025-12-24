# 🔍 Diagnóstico Rápido - Email não está sendo enviado

## 🧪 PASSO 1: Teste Isolado

Abra o arquivo **`teste-email.html`** no navegador (Chrome/Edge):

```
1. Navegue até: C:\Users\Crmv\Desktop\cyberlife\teste-email.html
2. Clique duas vezes para abrir no navegador
3. Clique no botão "🚀 Enviar Email de Teste"
4. Veja os logs no console da página
```

### ✅ Se o teste FUNCIONAR:
- O problema está no fluxo de confirmação de email do Supabase
- Vá para PASSO 3

### ❌ Se o teste FALHAR:
- O problema está na configuração do EmailJS
- Vá para PASSO 2

---

## 🔧 PASSO 2: Verificar Configuração EmailJS

### 2.1 Verificar Service

```
1. Acesse: https://dashboard.emailjs.com/admin
2. Clique em "Email Services"
3. Verifique se "service_vvcar35" existe
4. Status deve estar: ✅ ACTIVE
5. Deve estar conectado ao Gmail (cyberlife964@gmail.com)
```

**Se NÃO estiver conectado:**
- Clique em "Connect Service"
- Escolha Gmail
- Faça login com cyberlife964@gmail.com
- Autorize o EmailJS

### 2.2 Verificar Template

```
1. Acesse: https://dashboard.emailjs.com/admin/templates
2. Procure por "template_suhs0ik"
3. Clique para abrir
4. Verifique se tem TODOS os parâmetros:
   - {{user_name}}
   - {{user_email}}
   - {{user_age}}
   - {{user_location}}
   - {{user_whatsapp}}
   - {{user_id}}
   - {{registration_date}}
```

**Se o template NÃO existir:**
- Clique em "Create New Template"
- Use o HTML do arquivo `EMAILJS-TEMPLATE-CONFIG.md`
- Salve com o nome `template_suhs0ik`

### 2.3 Verificar Public Key

```
1. Acesse: https://dashboard.emailjs.com/admin/account
2. Veja "API Keys" → "Public Key"
3. Copie a key
4. Deve ser: SxPIIDojWJxViW_q_
```

**Se for DIFERENTE:**
- Atualize no arquivo `StartScreen.jsx` linha 10
- Atualize no arquivo `teste-email.html` linha 95

### 2.4 Verificar Limite de Emails

```
1. No dashboard do EmailJS
2. Veja "Email Usage" (barra no topo)
3. Plano gratuito: 200 emails/mês
```

**Se atingiu o limite:**
- Aguarde o próximo mês
- OU faça upgrade para plano pago

---

## 🧩 PASSO 3: Verificar Fluxo no Site

### 3.1 Abrir Console do Navegador

```
1. Abra o site CyberLife
2. Pressione F12
3. Vá na aba "Console"
4. Limpe o console (ícone 🚫)
```

### 3.2 Criar Nova Conta

```
1. Clique em START
2. Crie uma nova conta de teste:
   - Email: teste123@example.com
   - Nome: Teste EmailJS
   - Idade: 25
   - Cidade: Guaíra
   - Estado: SP
   - WhatsApp: (17) 99999-9999
3. Clique em "Criar Conta"
```

### 3.3 Confirmar Email

```
1. Vá no email: teste123@example.com
2. Abra o email do Supabase
3. Clique no link de confirmação
```

### 3.4 Verificar Logs

Você deve ver esta sequência no console:

```
✅ Logs Esperados:
🔔 Auth event: SIGNED_UP Mode: register
🔔 Auth event: SIGNED_IN Mode: awaiting-confirmation
✅ Email confirmado! Buscando perfil...
⏳ Tentativa 1/3: Perfil ainda não criado, aguardando...
📋 Perfil encontrado: {full_name: "Teste EmailJS", ...}
📧 Iniciando envio de notificação...
👤 User: {id: "...", email: "teste123@example.com", ...}
📋 Profile: {full_name: "Teste EmailJS", ...}
📨 Parâmetros do email: {...}
🚀 Enviando email via EmailJS...
📬 Resposta EmailJS: {status: 200, text: "OK"}
✅ Email enviado com sucesso ao admin!
✅ Verifique cyberlife964@gmail.com (inclusive spam)
```

---

## ❌ Erros Comuns e Soluções

### Erro: "❌ Erro ao notificar admin: Failed to fetch"

**Causa:** Bloqueador de anúncios bloqueando `api.emailjs.com`

**Solução:**
```
1. Desative AdBlock, uBlock Origin, ou similar
2. OU adicione api.emailjs.com à lista de permissões
3. Recarregue a página (Ctrl+F5)
```

### Erro: "❌ The public key is required"

**Causa:** Public key não está sendo enviada ou está incorreta

**Solução:**
```
1. Verifique se emailjs.init() está sendo chamado
2. Arquivo StartScreen.jsx linha 10
3. Deve ter: emailjs.init('SxPIIDojWJxViW_q_')
```

### Erro: "❌ Service ID is invalid"

**Causa:** Service não existe ou está desativado

**Solução:**
```
1. Acesse dashboard do EmailJS
2. Email Services → service_vvcar35
3. Verifique se está ACTIVE
4. Reconecte ao Gmail se necessário
```

### Erro: "❌ Template ID is invalid"

**Causa:** Template não existe

**Solução:**
```
1. Acesse dashboard → Templates
2. Verifique se template_suhs0ik existe
3. Se não existir, crie usando o HTML do guia
```

### Nenhum Erro, Mas Email Não Chega

**Possíveis causas:**

1. **Email foi para SPAM**
   ```
   - Abra cyberlife964@gmail.com
   - Vá em "Spam" ou "Lixeira"
   - Procure por emails do EmailJS
   - Marque como "Não é spam"
   ```

2. **Service Desconectado**
   ```
   - EmailJS desconecta após inatividade
   - Reconecte no dashboard
   ```

3. **Filtro do Gmail**
   ```
   - Gmail pode estar bloqueando
   - Adicione noreply@emailjs.com aos contatos
   ```

---

## 🎯 Checklist Final

- [ ] Arquivo `teste-email.html` funciona
- [ ] Service `service_vvcar35` está ATIVO
- [ ] Service está conectado ao Gmail (cyberlife964@gmail.com)
- [ ] Template `template_suhs0ik` existe
- [ ] Template tem todos os 7 parâmetros
- [ ] Public Key `SxPIIDojWJxViW_q_` está correta
- [ ] Não atingiu limite de 200 emails/mês
- [ ] Bloqueador de anúncios desativado
- [ ] Console mostra logs sem erros
- [ ] Email confirmação do Supabase funciona

---

## 💡 Dica Extra

Se TUDO falhar, tente criar um novo template do zero:

```
1. Dashboard EmailJS → Create New Template
2. Nome: novo_usuario_cyberlife
3. Cole o HTML do EMAILJS-TEMPLATE-CONFIG.md
4. Salve e copie o novo Template ID
5. Atualize StartScreen.jsx linha 183 com o novo ID
6. Teste novamente
```

---

## 📞 Suporte

Se o problema persistir:

1. **Tire um print** dos logs do console (F12)
2. **Tire um print** do dashboard do EmailJS (Email History)
3. **Copie** a mensagem de erro completa
4. Me envie para análise detalhada

---

## 🚀 Teste Rápido Agora

```bash
# 1. Abra o arquivo de teste
start C:\Users\Crmv\Desktop\cyberlife\teste-email.html

# 2. Clique no botão de teste
# 3. Veja o resultado
```

Se o teste funcionar → problema está no fluxo do site
Se o teste falhar → problema está no EmailJS
