// Script para executar o SQL de criação da tabela de lives
// Este script pode ser executado com Node.js se você tiver as configurações do Supabase

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Verifica se o arquivo SQL existe
const sqlFilePath = './add-lives-menu.sql';
if (!fs.existsSync(sqlFilePath)) {
  console.error('Arquivo add-lives-menu.sql não encontrado!');
  process.exit(1);
}

// Lê o conteúdo do arquivo SQL
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('Conteúdo do SQL carregado com sucesso!');
console.log('Para executar este SQL no Supabase, você precisa das variáveis de ambiente:');
console.log('- SUPABASE_URL: URL do seu projeto Supabase');
console.log('- SUPABASE_SERVICE_ROLE_KEY: Chave de serviço do Supabase');

// Verifica se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.log('\nAVISO: Variáveis de ambiente do Supabase não encontradas.');
  console.log('Execute o SQL manualmente no painel do Supabase ou configure as variáveis de ambiente:');
  console.log('SUPABASE_URL=...');
  console.log('SUPABASE_SERVICE_ROLE_KEY=...');
  console.log('\nConteúdo do SQL:');
  console.log('-------------------');
  console.log(sqlContent);
  console.log('-------------------');
  process.exit(0);
}

// Cria cliente do Supabase com permissões de service_role
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function executeSql() {
  try {
    console.log('Executando script SQL no Supabase...');
    
    // Executa o script SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_text: sqlContent
    });
    
    if (error) {
      console.error('Erro ao executar o SQL:', error.message);
      process.exit(1);
    }
    
    console.log('Script SQL executado com sucesso!');
  } catch (err) {
    console.error('Erro ao conectar ou executar o SQL:', err.message);
    process.exit(1);
  }
}

// Executa a função
executeSql();