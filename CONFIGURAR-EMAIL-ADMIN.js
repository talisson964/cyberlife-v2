// ============================================
// CONFIGURAÇÃO: Notificação por Email para Admin
// ============================================

/*
  OPÇÃO 1: EmailJS (Recomendado - Grátis e Fácil)
  
  1. Crie uma conta em: https://www.emailjs.com/
  2. Vá em "Email Services" → "Add New Service"
  3. Conecte sua conta Gmail (cyberlife964@gmail.com)
  4. Vá em "Email Templates" → "Create New Template"
  5. Configure o template:
  
     Template ID: admin_new_user
     
     Subject: 🎮 Novo Usuário Cadastrado na CyberLife!
     
     Content:
     ```
     Olá Admin,
     
     Um novo usuário confirmou o email e foi registrado na CyberLife!
     
     📋 Dados do Usuário:
     Nome: {{user_name}}
     Email: {{user_email}}
     Idade: {{user_age}} anos
     Cidade/Estado: {{user_city}} - {{user_state}}
     WhatsApp: {{user_whatsapp}}
     Data de Cadastro: {{signup_date}}
     ID: {{user_id}}
     
     ---
     Esta é uma notificação automática do sistema CyberLife.
     ```
  
  6. Instale o pacote EmailJS:
     npm install @emailjs/browser
  
  7. Cole este código no StartScreen.jsx:
*/

import emailjs from '@emailjs/browser'

const notifyAdminNewUser = async (user, profile) => {
  try {
    const templateParams = {
      to_email: 'cyberlife964@gmail.com',
      user_name: profile?.full_name || 'Não informado',
      user_email: user.email,
      user_age: profile?.age || 'Não informado',
      user_city: profile?.city || 'Não informado',
      user_state: profile?.state || 'Não informado',
      user_whatsapp: profile?.whatsapp || 'Não informado',
      signup_date: new Date().toLocaleString('pt-BR'),
      user_id: user.id
    }

    await emailjs.send(
      'YOUR_SERVICE_ID',      // Da dashboard EmailJS
      'admin_new_user',       // Template ID que você criou
      templateParams,
      'YOUR_PUBLIC_KEY'       // Public Key da dashboard
    )

    console.log('✅ Notificação enviada para admin')
  } catch (error) {
    console.error('❌ Erro ao notificar admin:', error)
  }
}

/*
  OPÇÃO 2: Supabase Edge Function (Mais Avançado)
  
  1. Instale Supabase CLI: npm install -g supabase
  2. Crie uma Edge Function:
     supabase functions new notify-admin
  
  3. Cole este código em supabase/functions/notify-admin/index.ts:
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

serve(async (req) => {
  const { user, profile } = await req.json()
  
  const client = new SmtpClient()
  
  await client.connectTLS({
    hostname: "smtp.gmail.com",
    port: 465,
    username: "cyberlife964@gmail.com",
    password: "YOUR_APP_PASSWORD", // App Password do Gmail
  })
  
  await client.send({
    from: "noreply@cyberlife.com",
    to: "cyberlife964@gmail.com",
    subject: "🎮 Novo Usuário Cadastrado na CyberLife!",
    content: `
      Novo usuário confirmou email!
      
      Nome: ${profile.full_name}
      Email: ${user.email}
      Idade: ${profile.age} anos
      Cidade: ${profile.city} - ${profile.state}
      WhatsApp: ${profile.whatsapp}
      Data: ${new Date().toLocaleString('pt-BR')}
      ID: ${user.id}
    `,
  })
  
  await client.close()
  
  return new Response("OK", { status: 200 })
})

/*
  4. Deploy a function:
     supabase functions deploy notify-admin
  
  5. No código React, chame:
*/

const notifyAdminNewUser = async (user, profile) => {
  try {
    await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/notify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ user, profile })
    })
  } catch (error) {
    console.error('Erro ao notificar admin:', error)
  }
}

/*
  OPÇÃO 3: SendGrid (Profissional)
  
  1. Crie conta em: https://sendgrid.com/ (100 emails/dia grátis)
  2. Crie API Key no dashboard
  3. Instale: npm install @sendgrid/mail
  4. Configure no backend ou Edge Function
*/

// ============================================
// RECOMENDAÇÃO:
// Use EmailJS para simplicidade e rapidez.
// É gratuito até 200 emails/mês e não precisa backend.
// ============================================
