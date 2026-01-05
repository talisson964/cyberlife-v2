// Teste para verificar produtos na tabela
import { supabase } from './src/supabaseClient.js';

async function testProducts() {
  console.log('🔍 Verificando produtos na tabela...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }

    console.log(`✅ Encontrados ${data.length} produtos na tabela`);
    
    if (data.length > 0) {
      console.log('📋 Primeiros produtos:');
      data.forEach(product => {
        console.log(`- ${product.name} (${product.category}) - R$ ${product.price}`);
      });
    } else {
      console.log('📦 Nenhum produto encontrado na tabela. Use o botão de importar no admin.');
    }
  } catch (err) {
    console.error('❌ Erro na consulta:', err);
  }
}

testProducts();